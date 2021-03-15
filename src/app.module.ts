import { HttpModule, Module } from '@nestjs/common'
import { AppGateway } from './app.gateway'
import { SocketChannelsModule } from './socket-channels/socket-channels.module'
import { SocketChannelsService } from './socket-channels/socket-channels.service'
import { BullModule } from '@nestjs/bull'
import { ConfigModule, ConfigService } from '@nestjs/config'
import config from './config'

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [config]
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get('redisHost'),
                    port: configService.get('redisPort')
                }
            })
        }),
        BullModule.registerQueue({
            name: 'messages'
        }),
        HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                baseURL: configService.get('productsURL')
            })
        }),
        SocketChannelsModule
    ],
    providers: [AppGateway, SocketChannelsService]
})
export class AppModule {
}
