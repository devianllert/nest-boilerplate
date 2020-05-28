import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Ip,
  Headers,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';


import { User } from '../users/users.entity';

import { GetUser } from '../../decorators/user.decorator';
import { Cookie } from '../../decorators/cookie.decorator';
import { AuthorizeGuard } from '../../guards/auth.guard';

import { AuthService } from './auth.service';

import { UserLoginDTO } from './dto/userLogin.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { JwtDTO } from './dto/jwt.dto';
import { UserVerifyDTO } from './dto/userVerify.dto';
import { UserVerifyResendDTO } from './dto/userVerifyResend.dto';
import { UserForgotDTO } from './dto/UserForgot.dto';
import { UserResetDTO } from './dto/UserReset.dto';

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('forgot')
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse()
  async forgot(@Body() payload: UserForgotDTO): Promise<void> {
    await this.authService.forgot(payload.emailOrUsername);
  }

  @Post('reset')
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse()
  async reset(@Body() payload: UserResetDTO): Promise<void> {
    await this.authService.reset(payload.token, payload.password);
  }

  @Post('register')
  @ApiConflictResponse()
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse()
  async register(@Body() payload: UserRegisterDTO): Promise<User> {
    const user = await this.authService.register(payload);

    return user;
  }

  @Post('register/verify')
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse()
  async registerVerify(@Body() payload: UserVerifyDTO): Promise<void> {
    await this.authService.verifyEmail(payload.token);
  }

  @Post('register/verify/resend')
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse()
  async resendVerify(@Body() payload: UserVerifyResendDTO): Promise<void> {
    await this.authService.resendVerifyEmail(payload.email);
  }

  @Post('login')
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse()
  async login(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Response() res: ExpressResponse,
    @Body() payload: UserLoginDTO,
  ): Promise<JwtDTO> {
    const tokens = await this.authService.login(
      ip,
      userAgent,
      payload.emailOrUsername,
      payload.password,
    );

    // TODO: Move to decorator
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 604800000,
      path: '/api/v1/auth',
      httpOnly: true,
    });

    res.status(200).json(tokens);

    return tokens;
  }

  @Post('logout')
  @AuthorizeGuard()
  @ApiBadRequestResponse({ description: 'Bad Request' })
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

    res.status(200).end();
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

    res.status(200).json(tokens);

    return tokens;
  }
}
