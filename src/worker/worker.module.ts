import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ChannelsModule } from './channels/channels.module'
import { BullModule } from '@nestjs/bull'
import { MessageQueueModule } from './message-queue/message-queue.module'
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
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get('database')
            })
        }),
        ChannelsModule,
        MessageQueueModule
    ]
})
export class WorkerModule {}
