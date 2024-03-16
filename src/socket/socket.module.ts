import { Module } from "@nestjs/common";
import { MyGateway } from "./socket.gareway";
import { SocketService } from "./socket.service";

@Module({
    providers: [MyGateway, SocketService ]
})

export class SocketModule { }