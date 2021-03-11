import { Module } from '@nestjs/common'
import { SocketChannelsService } from './socket-channels.service';

@Module({
    imports: [],
    providers: [SocketChannelsService],
    exports: [SocketChannelsService]
})
export class SocketChannelsModule {}