import {
  Controller,
  Get,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GetUser } from '../../decorators/user.decorator';

import { Session } from './sessions.entity';

import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@Controller('sessions')
@UsePipes(new ValidationPipe({ whitelist: true }))
@UseInterceptors(ClassSerializerInterceptor)
export class SessionsController {
  constructor(private sessionService: SessionsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse()
  async findAllSessions(@GetUser('id') id: number): Promise<Session[]> {
    const sessions = await this.sessionService.findAllSessions(id);

    return sessions;
  }

  @Get(':token')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse()
  async findSession(@Param('token') token: string): Promise<Session | undefined> {
    const session = await this.sessionService.findSession(token);

    return session;
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse()
  async deleteAllSessions(@GetUser('id') id: number): Promise<void> {
    await this.sessionService.clearAllSessions(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse()
  async deleteSession(@GetUser('id') userId: number, @Param('id') id: number): Promise<void> {
    await this.sessionService.clearSessionById(userId, id);
  }
}
