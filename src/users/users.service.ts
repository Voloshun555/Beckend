import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

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
  findOne(idOrEmail: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            id: idOrEmail,
          },
          {
            email: idOrEmail,
          },
        ],
      },
    });
  }
  delete(id: string) {
    return this.prismaService.user.delete({
      where: {id}, select: {id: true}
    })
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10))
  }
}
