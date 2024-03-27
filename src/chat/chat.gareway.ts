import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ChatroomService } from './chat.service';

@Injectable()
@WebSocketGateway({ cors: true })
export class ChatGateway {
    constructor(private readonly chatroomService: ChatroomService) { }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    async sendMessage(@MessageBody() { content, chatId, senderId }: { content: string, chatId: string, senderId: string }) {
        const message = await this.chatroomService.sendMessage(chatId, content, senderId);
        this.server.sockets.emit('receive_message', message);
    }

    @SubscribeMessage('joinRoom')
    async addUserForChatRoom(@MessageBody() { email, chatRoomId }) {
        const chatRoom = await this.chatroomService.addUsersToChatroom(email, chatRoomId)
        this.server.sockets.emit('receive_joinRoom', chatRoom);
    }

} 