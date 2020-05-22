import {
  Controller,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { User } from './users.entity';

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
}
