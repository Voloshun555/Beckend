import {
  Body,
  ClassSerializerInterceptor,
  Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseInterceptors
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponse } from './responses/user.respons';

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
 async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
  return this.usersService.delete(id)
  

  }
}
