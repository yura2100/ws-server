import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Channel, ChannelSchema } from '../channels/channel.schema'
import { ChannelsModule } from '../channels/channels.module'
import { ChannelsService } from '../channels/channels.service'
import { BullModule } from '@nestjs/bull'
import { MessageQueueProcessor } from './message-queue.processor'

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'messages'
        }),
        MongooseModule.forFeature([
            { name: Channel.name, schema: ChannelSchema }
        ]),
        ChannelsModule
    ],
    providers: [MessageQueueProcessor, ChannelsService]
})
export class MessageQueueModule {}