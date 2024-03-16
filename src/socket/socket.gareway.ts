import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: true })
export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly socketService: SocketService) { }
    @WebSocketServer() server: { emit: (arg0: string, arg1: { userId: string; status: boolean; }) => void; };

    async handleConnection(client: Socket): Promise<void> {
        const userId = client.handshake.query.userId as string;
        await this.socketService.markUserOnline(userId);
        this.server.emit('onlineStatus', { userId, status: true });
    }

    async handleDisconnect(client: Socket): Promise<void> {
        const userId = client.handshake.query.userId as string;
        await this.socketService.markUserOffline(userId);
        this.server.emit('onlineStatus', { userId, status: false });
    }
}   