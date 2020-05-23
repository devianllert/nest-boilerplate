import {
  Controller,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { AuthorizeGuard } from '../../guards/auth.guard';
import { GetUser } from '../../decorators/user.decorator';

import { User } from './users.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  @AuthorizeGuard()
  @ApiOkResponse()
  findMe(@GetUser() user: User): User {
    return user;
  }
}
