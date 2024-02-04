import {
  Body,
  ClassSerializerInterceptor,
  Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseInterceptors
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponse } from './responses/user.respons';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { JwtPayload } from '@auth/interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':idOrEmail')
  async findOneUser(@Param('idOrEmail') idOrEmail: string) {
    const user = await this.usersService.findOne(idOrEmail)
    return new UserResponse(user)

  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') user: JwtPayload) {
    return this.usersService.delete(id, user)


  }
}
