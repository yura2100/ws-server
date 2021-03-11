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

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(AppGateway.name)

    constructor(private readonly socketChannelsService: SocketChannelsService) {
    }

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
    handleChannelAdd(
        @MessageBody() channel: string,
        @ConnectedSocket() client: Socket
    ) {
        const status = this.socketChannelsService.addChannel(channel, client)

        client.send(JSON.stringify({
            channel,
            status,
            event: 'add'
        }))
    }

    @SubscribeMessage('delete')
    handleChannelDelete(
        @MessageBody() channel: string,
        @ConnectedSocket() client: Socket
    ) {
        const status = this.socketChannelsService.deleteChannel(channel, client)

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
    handleMessage(
        @MessageBody() { channel, message },
        @ConnectedSocket() client: Socket) {
        const sockets = this.socketChannelsService.getClients(channel)

        if (sockets.includes(client)) {
            const response = JSON.stringify({
                channel,
                status: true,
                event: 'message',
                message: message
            })

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
