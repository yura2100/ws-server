import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit, SubscribeMessage,
    WebSocketGateway
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { SocketChannelsService } from './socket-channels/socket-channels.service'
import { Socket } from './socket'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(AppGateway.name)

    constructor(
        private readonly socketChannelsService: SocketChannelsService,
        @InjectQueue('messages') private readonly messagesQueue: Queue
    ) {}

    afterInit(server: any) {
        this.logger.log('Init')
    }

    handleConnection(client: Socket) {
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
        @ConnectedSocket() client: Socket) {
        const sockets = this.socketChannelsService.getClients(channel)

        if (sockets.includes(client)) {
            const response = JSON.stringify({
                channel,
                message,
                status: true,
                event: 'message'
            })

            await this.messagesQueue.add('addMessage', {channel, message})

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
}
