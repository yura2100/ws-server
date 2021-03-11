import { Module } from '@nestjs/common'
import { AppGateway } from './app.gateway'
import { SocketChannelsModule } from './socket-channels/socket-channels.module'

@Module({
    imports: [SocketChannelsModule],
    providers: [AppGateway]
})
export class AppModule {
}
