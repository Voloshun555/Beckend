
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: true })
export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly socketService: SocketService) { }
    @WebSocketServer()
    server: Server;
    private connectedUsers: Set<string> = new Set();

    async handleConnection(client: Socket): Promise<void> {
        let userId: string;
        if (Array.isArray(client.handshake.query.userId)) {
            userId = client.handshake.query.userId[0];
        } else {
            userId = client.handshake.query.userId;
        }
        this.connectedUsers.add(userId);
        this.sendUsersStatus();

        await this.socketService.markUserOnline(userId);

    }

    async handleDisconnect(client: Socket): Promise<void> {
        let userId: string;
        if (Array.isArray(client.handshake.query.userId)) {
            userId = client.handshake.query.userId[0];
        } else {
            userId = client.handshake.query.userId;
        }
        console.log("userIdDisconnect", userId);
        this.connectedUsers.delete(userId);
        this.sendUsersStatus();
        await this.socketService.markUserOffline(userId);

    }

    private sendUsersStatus() {
        const usersStatus = Array.from(this.connectedUsers).map(userId => ({ userId, isOnline: true }));
        this.server.emit('usersStatus', usersStatus);
    }
}   