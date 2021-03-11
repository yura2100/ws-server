import { Injectable } from '@nestjs/common'
import { Socket } from '../socket'

@Injectable()
export class SocketChannelsService {
    private readonly channels = new Map<string, Socket[]>()


    getClients(channel: string): Socket[] {
        return this.channels.get(channel) ?? []
    }

    addChannel(channel: string, socket: Socket): boolean {
        if (this.channels.has(channel))
            return false

        socket.createdChannels.push(channel)
        this.channels.set(channel, [])
        return true
    }

    deleteChannel(channel: string, socket: Socket): boolean {
        if (!socket.createdChannels.includes(channel))
            return false

        const sockets = this.channels.get(channel)

        if (!sockets) {
            return false
        }

        sockets.forEach(socket => {
            const channelIndex = socket.channels.indexOf(channel)
            socket.channels.splice(channelIndex, 1)
        })

        const channelIndex = socket.createdChannels.indexOf(channel)
        socket.createdChannels.splice(channelIndex, 1)
        this.channels.delete(channel)

        return true
    }

    joinChannel(channel: string, socket: Socket) {
        const sockets = this.channels.get(channel)

        if (!sockets) {
            return false
        }

        if (sockets.includes(socket)) {
            return false
        }

        sockets.push(socket)
        return true
    }

    leaveChannel(channel: string, socket: Socket): boolean {
        const sockets = this.channels.get(channel)

        if (!sockets) {
            return false
        }

        const socketIndex = sockets.indexOf(socket)

        if (socketIndex === -1) {
            return false
        }

        sockets.splice(socketIndex, 1)

        const channelIndex = socket.channels.indexOf(channel)
        socket.channels.splice(channelIndex, 1)

        return true
    }

    deleteClient(socket: Socket) {
        for (const channel of socket.createdChannels) {
            this.channels.delete(channel)
        }

        for (const channel of socket.channels) {
            const sockets = this.channels.get(channel)
            const socketIndex = sockets.indexOf(socket)
            sockets.splice(socketIndex, 1)

        }
    }
}
