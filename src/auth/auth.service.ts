import { ConflictException, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '@users/users.service';
import { LoginDto } from './dto/login.dto';
import { Tokens } from './interface';
import { compareSync } from 'bcryptjs';
import { Provider, Token, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name)
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) { }

  async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
    const token = await this.prismaService.token.delete({ where: { token: refreshToken } });
    if (!token || new Date(token.exp) < new Date()) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOne(token.userId);
    return this.generateToken(user, agent);
  }

  async register(registerDto: RegisterDto) {
    const user: User = await this.userService.findOne(registerDto.email).catch((err) => {
      this.logger.error(err)
      return null
    })

    if (user) {
      throw new ConflictException(`Користувач с таким ${registerDto.email} уже існує`)
    }
    return this.userService.save(registerDto).catch((err) => {
      this.logger.error(err)
      return null
    })
  }

  async login(loginDto: LoginDto, agent: string): Promise<Tokens> {
    const user: User = await this.userService.findOne(loginDto.email, true).catch((err) => {
      this.logger.error(err)
      return null
    })
    if (!user || !compareSync(loginDto.password, user.password)) {
      throw new UnauthorizedException('Не правельний логін чи пароль')
    }

    return this.generateToken(user, agent)
  }

   async generateToken(user: User, agent: string): Promise<Tokens> {
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      roles: user.roles,
      name: user.name
    })

    const refreshToken = await this.getRefreshToken(user.id, agent)

    return { accessToken, refreshToken }
  }

  private async getRefreshToken(userId: string, agent: string): Promise<Token> {
    const _token = await this.prismaService.token.findFirst({
      where: {
        userId,
        userAgent: agent
      }

    })
    const token = _token?.token ?? '';
    return this.prismaService.token.upsert({
      where: { token },
      update: {
        token: v4(),
        exp: add(new Date, { months: 1 }),
      },
      create: {
        token: v4(),
        exp: add(new Date, { months: 1 }),
        userId,
        userAgent: agent
      }
    })
  }

  deleteRefreshToken(token: string) {
    return this.prismaService.token.delete({
      where: {
      token
    }})
  }

  async providerAuth(email: string, agent: string, provider: Provider) {
    const userExists = await this.userService.findOne(email);
    if (userExists) {
      const user = await this.userService.save({ email, provider }).catch((err) => {
        this.logger.error(err);
        return null;
      });
      return this.generateToken(user, agent);
    }
    const user = await this.userService.save({ email, provider }).catch((err) => {
      this.logger.error(err);
      return null;
    });
    if (!user) {
      throw new HttpException(
        `Не получилось создать пользователя с email ${email} в Google auth`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.generateToken(user, agent);
  }


  isValidAuthHeader(authorization: string) {
    const token = authorization.split(' ')[1];
    return this.jwtService.verify(token);
  }
}
