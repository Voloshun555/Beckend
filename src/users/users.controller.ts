import {
  Body,
  ClassSerializerInterceptor,
  Controller, Delete, Get, Param, ParseUUIDPipe, Put, UseGuards, UseInterceptors
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponse } from './responses/user.respons';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { JwtPayload } from '@auth/interface';
import { RolesGuard } from '@auth/guargs/role.guard';
import { UserDto } from './dto/update-user.dto';
import { Auth } from '@shared/decorators/auth.decorator';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly userService: UsersService) { }
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

  @UseGuards(RolesGuard)
  @Get()
  @Auth()
  async profile(@CurrentUser('id') id: string) {
    return this.userService.getProfile(id)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Put()
  async updateUser(@CurrentUser('id') id: string, @Body() dto: UserDto) {
    return this.userService.update(id, dto)
  }

  @Get('all/users')
  @Auth()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }
}