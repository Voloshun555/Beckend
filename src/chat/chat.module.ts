import { Module } from '@nestjs/common';
import { ChatroomService } from './chat.service';
import { ChatroomController } from './chat.controller';
import { ChatGateway } from './chat.gareway';

@Module({
  controllers: [ChatroomController],
  providers: [ChatroomService, ChatGateway],
})
export class ChatModule {}
