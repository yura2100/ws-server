import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit, SubscribeMessage,
    WebSocketGateway
} from '@nestjs/websockets'
import { HttpService, Logger } from '@nestjs/common'
import { SocketChannelsService } from './socket-channels/socket-channels.service'
import { Socket } from './socket'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { v4 as uuid } from 'uuid'

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(AppGateway.name)

    constructor(
        private readonly httpService: HttpService,
        private readonly socketChannelsService: SocketChannelsService,
        @InjectQueue('messages') private readonly messagesQueue: Queue
    ) {
    }

    afterInit(server: any) {
        this.logger.log('Init')
    }

    handleConnection(client: Socket) {
        client.id = uuid()
        client.channels = []
        client.createdChannels = []
    }

    handleDisconnect(client: Socket) {
        this.socketChannelsService.deleteClient(client)
    }

    @SubscribeMessage('add')
    async handleChannelAdd(
        @MessageBody() channel: string,
        @ConnectedSocket() client: Socket
    ) {
        const status = this.socketChannelsService.addChannel(channel, client)

        if (status) {
            await this.messagesQueue.add('create', { channel })
        }

        client.send(JSON.stringify({
            channel,
            status,
            event: 'add'
        }))
    }

    @SubscribeMessage('delete')
    async handleChannelDelete(
        @MessageBody() channel: string,
        @ConnectedSocket() client: Socket
    ) {
        const status = this.socketChannelsService.deleteChannel(channel, client)

        if (status) {
            await this.messagesQueue.add('delete', { channel })
        }

        client.send(JSON.stringify({
            channel,
            status,
            event: 'delete'
        }))
    }

    @SubscribeMessage('join')
    handleChannelJoin(
        @MessageBody() channel: string,
        @ConnectedSocket() client: Socket
    ) {
        const status = this.socketChannelsService.joinChannel(channel, client)

        client.send(JSON.stringify({
            channel,
            status,
            event: 'join'
        }))
    }

    @SubscribeMessage('leave')
    handleChannelLeave(
        @MessageBody() channel: string,
        @ConnectedSocket() client: Socket
    ) {
        const status = this.socketChannelsService.leaveChannel(channel, client)


        client.send(JSON.stringify({
            channel,
            status,
            event: 'leave'
        }))
    }

    @SubscribeMessage('message')
    async handleMessage(
        @MessageBody() { channel, message },
        @ConnectedSocket() client: Socket
    ) {
        const sockets = this.socketChannelsService.getClients(channel)

        if (sockets.includes(client)) {
            const response = JSON.stringify({
                channel,
                message,
                status: true,
                event: 'message'
            })

            await this.messagesQueue.add('addMessage', { userId: client.id, channel, message })

            sockets.forEach(socket => {
                socket.send(response)
            })
            return
        }

        client.send(JSON.stringify({
            channel,
            status: false,
            event: 'message'
        }))
    }

    @SubscribeMessage('get')
    async handleGetProducts(
        @ConnectedSocket() client: Socket
    ) {
        const products = await this.httpService.get('/products').toPromise()

        client.send(JSON.stringify({
            products: products.data,
            event: 'get'
        }))
    }

    @SubscribeMessage('getOne')
    async handleGetOneProduct(
        @MessageBody() productId: string,
        @ConnectedSocket() client: Socket
    ) {
        const product = await this.httpService.get(`/products/${productId}`).toPromise()

        client.send(JSON.stringify({
            product: product.data,
            event: 'getOne'
        }))
    }

    @SubscribeMessage('postOrder')
    async handlePostOrder(
        @MessageBody() { productId, quantity },
        @ConnectedSocket() client: Socket
    ) {
        try {
        await this.httpService.post('/orders', {
            userId: client.id,
                productsList: [
                {
                    productId: productId,
                    quantity: quantity
                }
            ]
        }).toPromise()

        client.send(JSON.stringify({
            status: true,
            event: 'postOrder'
        }))
        } catch (e) {
            client.send(JSON.stringify({
                status: false,
                event: 'postOrder'
            }))
        }
    }
}
