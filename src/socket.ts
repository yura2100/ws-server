import WebSocket from 'ws'

export interface Socket extends WebSocket {
    id: string
    channels: string[]
    createdChannels: string[]
}