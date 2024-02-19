import { Module } from '@nestjs/common';
import { ChatroomService } from './chat.service';
import { ChatroomController } from './chat.controller';

@Module({
  controllers: [ChatroomController],
  providers: [ChatroomService],
})
export class ChatModule {}
