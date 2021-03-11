import WebSocket from 'ws'

export interface Socket extends WebSocket {
    channels: string[]
    createdChannels: string[]
}