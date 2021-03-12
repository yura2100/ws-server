import { Document } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Message } from './message'

export type ChannelDocument  = Channel & Document

@Schema()
export class Channel {
    @Prop({
        required: true
    })
    name: string

    @Prop({
        type: [{
            message: {type: String, required: true},
            date: {type: Number, required: true}
        }]
    })
    messages: Message[]
}

export const ChannelSchema = SchemaFactory.createForClass(Channel)