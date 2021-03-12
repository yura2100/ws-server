import { Module } from '@nestjs/common'
import { AppGateway } from './app.gateway'
import { SocketChannelsModule } from './socket-channels/socket-channels.module'
import { SocketChannelsService } from './socket-channels/socket-channels.service'
import { BullModule } from '@nestjs/bull'
import { ConfigModule } from '@nestjs/config'
import config from './config'

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [config]
        }),
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379
            }
        }),
        BullModule.registerQueue({
            name: 'messages'
        }),
        SocketChannelsModule
    ],
    providers: [AppGateway, SocketChannelsService]
})
export class AppModule {
}
