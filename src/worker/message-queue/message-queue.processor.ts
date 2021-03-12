import { Process, Processor } from '@nestjs/bull'
import { ChannelsService } from '../channels/channels.service'
import { Job } from 'bull'

@Processor('messages')
export class MessageQueueProcessor {
    constructor(
        private readonly channelsService: ChannelsService
    ) {}

    @Process('create')
    async create(job: Job) {
        const {channel} = job.data

        await this.channelsService.create(channel)
    }

    @Process('delete')
    async delete(job: Job) {
        const {channel} = job.data

        await this.channelsService.delete(channel)
    }

    @Process('addMessage')
    async addMessage(job: Job) {
        const {channel, message} = job.data

        await this.channelsService.addMessage(channel, message)
    }
}