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
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, Tokens } from './interface';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie } from '@shared/decorators/cookies.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { UserResponse } from '@users/responses/user.respons';
import { GoogleGuard } from './guargs/googgle.guard';
import { HttpService } from '@nestjs/axios';
import { map, mergeMap } from 'rxjs';
import { Provider, User } from '@prisma/client';
import { handleTimeoutAndErrors } from '@shared/helpers/timeout-error.helper';
import { UsersService } from '@users/users.service';

const REFRESH_TOKEN = 'refreshtoken'
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userService: UsersService) { }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response, @UserAgent() agent: string) {
    const user = await this.authService.register(registerDto);
    if (!user) {
      throw new BadRequestException(`Не вдається зареєструвати користувача з даними ${JSON.stringify(registerDto)}`);
    }
    const tokens = await this.authService.generateToken(user, agent);
    this.setRefreshTokenCookies(tokens, res);
    const data = new UserResponse(user);
    res.json({ accessToken: tokens.accessToken, data });
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response, @UserAgent() agent: string) {
    const user: User = await this.userService.findOne(loginDto.email) 
    const tokens = await this.authService.login(loginDto, agent)

    if (!tokens) {
      throw new BadRequestException(`Не получається увійти з данами ${JSON.stringify(loginDto)}`)
    }
    this.setRefreshTokenCookies(tokens, res)
    const data = new UserResponse(user);
    res.json({ accessToken: tokens.accessToken, data })
  }

  @Get('logout')
  async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK)
      return
    }
    await this.authService.deleteRefreshToken(refreshToken)
    res.cookie(REFRESH_TOKEN, '', { httpOnly: true, secure: true, expires: new Date() })
    res.sendStatus(HttpStatus.OK)
  }

  @Get('refresh-tokens')
  async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    if (!tokens) {
      throw new UnauthorizedException();
    }
    this.setRefreshTokenCookies(tokens, res);
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
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

  }

  @UseGuards(GoogleGuard)
  @Get('google')
  googleAuth() { }

  @UseGuards(GoogleGuard)
  @Get('google/callback')
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const token = req.user['accessToken'];
    return res.redirect(`http://localhost:3000/api/auth/success-google?token=${token}`);
  }

  @Get('success-google')
  success(@Query('token') token: string, @UserAgent() agent: string, @Res() res: Response) {
    return this.httpService.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
      .pipe(mergeMap(({ data: { email } }) => this.authService.providerAuth(email, agent, Provider.GOOGLE)),
        map(data => this.setRefreshTokenCookies(data, res)),
        handleTimeoutAndErrors(),
      )
  }
}
