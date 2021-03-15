import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Channel, ChannelDocument } from './channel.schema'

@Injectable()
export class ChannelsService {
    constructor(
        @InjectModel(Channel.name) private readonly channelModel: Model<ChannelDocument>
    ) {}

    async create(name: string) {
        await this.channelModel.create({name})
    }

    async delete(name: string) {
        await this.channelModel.findOneAndDelete({name})
    }

    async addMessage(userId: string, channelName: string, message: string) {
        const channel = await this.channelModel.findOne({name: channelName})
        channel.messages.push({
            userId,
            message,
            date: Date.now()
        })
        await channel.save()
    }
}