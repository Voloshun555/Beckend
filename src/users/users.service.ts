import { JwtPayload } from '@auth/interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import { convertToSecondsUtil } from '@shared/utils/convert-to-seconds.util';
import { genSaltSync, hashSync } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { UserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) { }

  async currentUser(user: Partial<User>) {
    const _user = this.prismaService.user.fields
    return _user
  }

  async save(user: Partial<User>) {
    const hashedPassword = user?.password ? this.hashPassword(user.password) : null;
    const savedUser = await this.prismaService.user.upsert({
      where: {
        email: user.email,
      },
      update: {
      password: hashedPassword ?? undefined,
        provider: user?.provider ?? undefined,
        roles: user?.roles ?? undefined,
        isBlocked: user?.isBlocked ?? undefined,
        name: user.name  ?? undefined

      },
      create: {
        email: user.email,
        password: hashedPassword,
        provider: user?.provider,
        roles: ['USER'],
        name: user.name
      },
    });
    await this.cacheManager.set(savedUser.id, savedUser);
    await this.cacheManager.set(savedUser.email, savedUser);
    return savedUser;
  }
  async findOne(idOrEmail: string, isReset = false): Promise<User> {
    if (isReset) {
      await this.cacheManager.del(idOrEmail);
    }

    const user = await this.cacheManager.get<User>(idOrEmail);
    if (!user) {
      const user = await this.prismaService.user.findFirst({
        where: {
          OR: [{ id: idOrEmail }, { email: idOrEmail }],
        },
      });
      if (!user) {
        return null;
      }
      await this.cacheManager.set(idOrEmail, user, convertToSecondsUtil(this.configService.get('JWT_EXP')));
      return user;
    }
    return user;
  }

  async delete(id: string, user: JwtPayload) {
    if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException()
    }
    await Promise.all([
      this.cacheManager.del(id),
      this.cacheManager.del(user.email)
    ])

    return this.prismaService.user.delete({
      where: { id }, select: { id: true }
    })
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10))
  }

  async update(id: string, dto: UserDto) {
    let data = dto

    if (dto.password) {
      data = { ...dto, password: this.hashPassword(dto.password) }
    }

    return this.prismaService.user.update({
      where: {
        id
      },
      data,
      select: {
        name: true,
        email: true
      }
    })
  }

  getById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id
      }
    })
  }

  async getProfile(id: string) {
    const profile = await this.getById(id)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = profile

    return {
      user: rest}
  }

}
