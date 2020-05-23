import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Ip,
  Headers,
  UseGuards,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response as ExpressResponse } from 'express';

import { User } from '../users/users.entity';
import { GetUser } from '../../decorators/user.decorator';
import { Cookie } from '../../decorators/cookie.decorator';

import { AuthService } from './auth.service';

import { UserLoginDTO } from './dto/userLogin.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { JwtDTO } from './dto/jwt.dto';

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: UserRegisterDTO): Promise<User> {
    const user = await this.authService.register(payload);

    return user;
  }

  @Post('login')
  async login(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Body() payload: UserLoginDTO,
    @Response() res: ExpressResponse,
  ): Promise<JwtDTO> {
    const tokens = await this.authService.login(ip, userAgent, payload);

    // TODO: Move to decorator
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 604800000,
      path: '/api/v1/auth',
      httpOnly: true,
    });

    res.json(tokens);

    return tokens;
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse()
  async logout(
    @GetUser('id') userId: number,
    @Cookie('refreshToken') refreshToken: string | undefined,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    // TODO: Move to decorator
    res.clearCookie('refreshToken');

    await this.authService.logout(userId, refreshToken);

    res.end();
  }

  @Post('refresh')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ type: JwtDTO })
  async refreshToken(
    @Cookie('refreshToken') refreshToken: string | undefined,
    @Response() res: ExpressResponse,
  ): Promise<JwtDTO> {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    // TODO: Move to decorator
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 604800000,
      path: '/api/v1/auth',
      httpOnly: true,
    });

    res.json(tokens);

    return tokens;
  }
}
