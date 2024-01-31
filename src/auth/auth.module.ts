import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { options } from './config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[PassportModule, JwtModule.registerAsync(options()), UsersModule]
})
export class AuthModule {}
