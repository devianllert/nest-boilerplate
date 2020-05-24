import {
  Controller,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { AuthorizeGuard } from '../../guards/auth.guard';
import { GetUser } from '../../decorators/user.decorator';

import { User } from './users.entity';
import { UsersService } from './users.service';
import { UpdateUserDTO } from './dto/updateUser.dto';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse()
  async findAll(): Promise<User[]> {
    const users = await this.usersService.findAll();

    return users;
  }

  @Get('me')
  @AuthorizeGuard()
  @ApiOkResponse()
  findMe(@GetUser() user: User): User {
    return user;
  }

  @Patch('me')
  @AuthorizeGuard()
  @ApiOkResponse()
  async updateMe(@GetUser() user: User, @Body() payload: UpdateUserDTO): Promise<void> {
    await this.usersService.updateUser(user, payload);
  }
}
