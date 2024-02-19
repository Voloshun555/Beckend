import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guargs/jwt-auth.guard';
import { MediaModule } from './media/media.module';
import { ChatModule } from './chat/chat.module';
import { WebsocketService } from './websocket/websocket.service';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true }), MediaModule, ChatModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  }, WebsocketService],
})
export class AppModule { }
