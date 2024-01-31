import {
  Body,
  Controller, Delete, Get, Param, ParseUUIDPipe, Post
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  createUser(@Body() dto) {
    return this.usersService.save(dto)
  }

  @Get(':idOrEmail')
  findOneUser(@Param('idOrEmail') idOrEmail: string) {
    return this.usersService.findOne(idOrEmail)
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id)
  }
}
