import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  Res,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Tokens } from './interface';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie } from '@shared/decorators/cookies.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { UserResponse } from '@users/responses/user.respons';

const REFRESH_TOKEN = 'refreshtoken'
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) { }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto)

    if (!user) {
      throw new BadRequestException(`Не получається зарегіструвати користувача з даними ${JSON.stringify(registerDto)}`)
    }

    return new UserResponse(user)
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response, @UserAgent() agent: string) {
    const tokens = await this.authService.login(loginDto, agent)

    if (!tokens) {
      throw new BadRequestException(`Не получається увійти з данами ${JSON.stringify(loginDto)}`)
    }
    this.setRefreshTokenCookies(tokens, res)
  }

  @Get('refresh-tokens')
  async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
    if (!refreshToken) {
      throw new UnauthorizedException()
    }


    const tokens = await this.authService.refreshTokens(refreshToken, agent)

    if (!tokens) {
      throw new UnauthorizedException()
    }
    this.setRefreshTokenCookies(tokens, res)

  }


  private setRefreshTokenCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException()
    }
    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    })
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken })
  }
}
