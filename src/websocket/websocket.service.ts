import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
export class WebsocketService implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    private readonly clients: Map<string, Socket> = new Map();

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
        this.clients.set(client.id, client);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
        this.clients.delete(client.id);
    }

    joinChat(client: Socket, chatId: string) {
        client.join(chatId);
    }

    leaveChat(client: Socket, chatId: string) {
        client.leave(chatId);
    }

    sendMessageToChat(chatId: string, message: any) {
        this.server.to(chatId).emit('newMessage', message);
    }
}