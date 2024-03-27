import { Controller, UseGuards, Post, Body, Get, Param, Delete, Request } from '@nestjs/common';
import { ChatroomService } from './chat.service';
import { RolesGuard } from '@auth/guargs/role.guard';

@Controller('chatrooms')
export class ChatroomController {
  constructor(
    private readonly chatroomService: ChatroomService,
  ) { }

  @UseGuards(RolesGuard)
  @Post(':chatroomId/messages')
  async sendMessage(
    @Param('chatroomId') chatroomId: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
 
    const newMessage = await this.chatroomService.sendMessage(
      chatroomId,
      content,
      req.user.id,
    );
    return newMessage;
  }

  @UseGuards(RolesGuard)
  @Post('create')
  async createChatroom(
    @Body('name') name: string,
    @Request() req: any,
  ) {
    const createChat = await this.chatroomService.createChatroom(name, req.user.id);
    return createChat 
  }

  @Post(':chatroomId/users')
  async addUsersToChatroom(
    @Param('chatroomId') chatroomId: string,
    @Body('userEmail') email: string[],
  ) {
    return this.chatroomService.addUsersToChatroom(chatroomId, email);
  }

  @Get(':userId/chatrooms')
  async getChatroomsForUser(@Param('userId') userId: string) {
    return this.chatroomService.getChatroomsForUser(userId);
  }

  @Get(':chatroomId/messages')
  async getMessagesForChatroom(@Param('chatroomId') chatroomId: string) {
    return this.chatroomService.getMessagesForChatroom(chatroomId);
  }

  @Delete(':chatroomId/delete')
  async deleteChatroom(@Param('chatroomId') chatroomId: string) {
    await this.chatroomService.deleteChatroom(chatroomId);
    return 'Chatroom deleted successfully';
  }
}