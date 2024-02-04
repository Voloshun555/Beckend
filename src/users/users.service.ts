import { JwtPayload } from '@auth/interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import { convertToSecondsUtil } from '@shared/utils/convert-to-seconds.util';
import { genSaltSync, hashSync } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) { }

  save(user: Partial<User>) {
    const heshedPassword = this.hashPassword(user.password)
    return this.prismaService.user.create({
      data: {
        email: user.email,
        password: heshedPassword,
        name: user.name,
        roles: ['USER'],
      },
    });
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
}
