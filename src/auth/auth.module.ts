import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { options } from './config';
import { STRAGIES } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guargs/jwt-auth.guard';
import { GoogleStrategy } from './strategies/google.stategy';
import { GoogleGuard } from './guargs/googgle.guard';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ...STRAGIES, JwtAuthGuard, GoogleStrategy, GoogleGuard],
  imports: [PassportModule, JwtModule.registerAsync(options()), UsersModule, HttpModule],
})
export class AuthModule {}
