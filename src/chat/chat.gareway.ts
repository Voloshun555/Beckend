import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ChatroomService } from './chat.service';

@Injectable()
@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly chatroomService: ChatroomService) { }

    @WebSocketServer()
    server: Server;

    private connectedUsers: Set<string> = new Set();
    

    handleConnection(client: Socket) {
        let userId: string;
        if (Array.isArray(client.handshake.query.userId)) {
            userId = client.handshake.query.userId[0];
        } else {
            userId = client.handshake.query.userId;
        }
        console.log("userIdConnection", userId);
        this.connectedUsers.add(userId);
        this.sendUsersStatus();
    }

    handleDisconnect(client: Socket) {
        let userId: string;
        if (Array.isArray(client.handshake.query.userId)) {
            userId = client.handshake.query.userId[0];
        } else {
            userId = client.handshake.query.userId;
        }
        console.log("userIdDisconnect", userId);

        this.connectedUsers.delete(userId);
        this.sendUsersStatus();
    }

    private sendUsersStatus() {
        const usersStatus = Array.from(this.connectedUsers).map(userId => ({ userId, isOnline: true }));
        this.server.emit('usersStatus', usersStatus);
    }

    @SubscribeMessage('message')
    async sendMessage(@MessageBody() { content, chatId, senderId }: { content: string, chatId: string, senderId: string }) {
        const message = await this.chatroomService.sendMessage(chatId, content, senderId);
        this.server.sockets.emit('receive_message', message);
    }

} 