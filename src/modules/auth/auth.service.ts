import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  sign,
  verify,
  JsonWebTokenError,
  TokenExpiredError,
} from 'jsonwebtoken';
import * as uuid from 'uuid';

import { detect } from '../../utils/parseUserAgent';

import { User } from '../users/users.entity';

import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { MailerService } from '../mailer/mailer.service';

import { Tokens } from './interfaces/tokens.interface';
import { UserLoginDTO } from './dto/userLogin.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private mailerService: MailerService,
    private jwtService: JwtService,
    private loggerService: LoggerService,
    private configService: ConfigService,
  ) {}

  async validateUser(payload: UserLoginDTO): Promise<User> {
    const { emailOrUsername, password } = payload;

    const user = await this.usersService.validateUser(emailOrUsername, password);

    if (!user) {
      throw new BadRequestException('LOGIN_ERROR');
    }

    return user;
  }

  createTokens(payload: string | object | Buffer): Tokens {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuid.v4();

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const { email } = verify(token, this.configService.get('token.EMAIL_SECRET')!) as { email: string };

      const user = await this.usersService.findByEmailOrUsername(email);

      // TODO?: catch if user not found

      if (user) {
        await this.usersService.updateVerifyEmail(user.email, true);
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BadRequestException('TOKEN_EXPIRED');
      }

      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('TOKEN_INVALID');
      }

      this.loggerService.error(error.message, error.trace, error.context);
    }
  }

  async resendVerifyEmail(email: string): Promise<void> {
    const user = await this.usersService.findByEmailOrUsername(email);

    if (!user || user.isVerified) throw new BadRequestException();

    // TODO?: send different mail for resending
    this.sendVerification(user);
  }

  // TODO?: create token in mailerService
  async sendVerification(user: User) {
    // We can create jwt token or can create UUID token and write it to something like Redis
    const emailToken = sign({ email: user.email, id: user.id }, this.configService.get('token.EMAIL_SECRET')!);
    // const resetToken = uuid.v4();

    await this.mailerService.sendRegistrationMail(user.email, user.username, emailToken);
  }

  async register(payload: UserRegisterDTO): Promise<User> {
    try {
      const user = await this.usersService.createUser(payload);

      // Don't wait for sending a message
      this.sendVerification(user);

      // We can create tokens and send them to register and login in one step.
      return user;
    } catch (error) {
      // Postgres throw 23505 error when a value in a column already exists
      if (error.code === '23505') throw new ConflictException('REGISTER_ERROR');

      this.loggerService.error(error.message, error.trace, error.context);

      throw new InternalServerErrorException();
    }
  }

  async login(ip: string, userAgent: string, payload: UserLoginDTO): Promise<Tokens> {
    const user = await this.validateUser(payload);

    const jwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const tokens = this.createTokens(jwtPayload);

    // TODO?: move parsing ua in createSession
    const device = detect(userAgent);

    await this.sessionsService.createSession({
      os: device.os,
      browser: `${device.name} ${device.version}`,
      userAgent,
      ip,
      token: tokens.refreshToken,
      expiresIn: Math.floor(new Date().getTime() / 1000) + 604800,
    }, user);

    return tokens;
  }

  async logout(userId: number, token: string): Promise<void> {
    await this.sessionsService.clearSessionByToken(userId, token);
  }

  async refreshTokens(token: string): Promise<Tokens> {
    const session = await this.sessionsService.findSession(token);

    if (!session) {
      throw new UnauthorizedException();
    }

    const isExpire = Math.round(new Date().getTime() / 1000) > session.expiresIn;

    if (isExpire) {
      await this.sessionsService.clearSessionByToken(session.userId, token);

      throw new HttpException('TOKEN_EXPIRED', 403);
    }

    const user = await this.usersService.findById(session.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const jwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const tokens = this.createTokens(jwtPayload);

    await this.sessionsService.updateSession(session.userId, session.token, {
      token: tokens.refreshToken,
      expiresIn: Math.floor(new Date().getTime() / 1000) + 604800,
    });

    return tokens;
  }

  async forgot(emailOrUsername: string): Promise<void> {
    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new BadRequestException();
    }

    // We can create jwt token or can create UUID token and write it to something like Redis
    const resetToken = sign({ email: user.email, id: user.id }, this.configService.get('token.RESET_SECRET')!);
    // const resetToken = uuid.v4();

    this.mailerService.sendResetPasswordMail(user.email, user.username, resetToken);
  }

  async reset(token: string, password: string): Promise<void> {
    try {
      const { email } = verify(token, this.configService.get('token.RESET_SECRET')!) as { email: string };

      const user = await this.usersService.findByEmailOrUsername(email);

      if (user) {
        await this.usersService.updatePassword(user.email, password);

        this.sessionsService.clearAllSessions(user.id);

        await this.mailerService.sendPasswordChangedMail(user.email, user.username);
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BadRequestException('TOKEN_EXPIRED');
      }

      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('TOKEN_INVALID');
      }
    }
  }
}
