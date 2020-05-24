import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as uuid from 'uuid';

import { detect } from '../../utils/parseUserAgent';

import { User } from '../users/users.entity';

import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { MailerService } from '../mailer/mailer.service';

import { Tokens } from './interfaces/tokens.interface';
import { UserLoginDTO } from './dto/userLogin.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private mailerService: MailerService,
    private jwtService: JwtService,
  ) {}

  async validateUser(payload: UserLoginDTO): Promise<User> {
    const { emailOrUsername, password } = payload;

    const user = await this.usersService.validateUser(emailOrUsername, password);

    if (!user) {
      // TODO: add error description
      throw new BadRequestException({ code: 'LOGIN_ERROR' });
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

  async verifyEmail(email: string, token: string) {
    const user = await this.usersService.findByEmailOrUsername(email);

    if (!user || !token) throw new BadRequestException();

    // TODO: verify token

    await this.usersService.updateVerifyEmail(user.id, true);
  }

  async resendVerifyEmail(email: string) {
    const user = await this.usersService.findByEmailOrUsername(email);

    if (!user || user.isVerified) throw new BadRequestException();

    // TODO: send different mail for resending
    await this.sendVerification(user.email, user.username);
  }

  // TODO: connect redis for email verification
  // TODO?: create uuid token in mailerService
  async sendVerification(email: string, username: string) {
    const emailToken = uuid.v4();

    await this.mailerService.sendRegistrationMail(
      email,
      username,
      emailToken,
    );
  }

  async register(payload: UserRegisterDTO): Promise<User> {
    try {
      const user = await this.usersService.createUser(payload);

      // Don't wait for sending a message
      this.sendVerification(user.email, user.username);

      // We can create tokens and send them to register and login in one step.
      return user;
    } catch (error) {
      // Postgres throw 23505 error when a value in a column already exists
      if (error.code === '23505') throw new ConflictException({ code: 'REGISTER_ERROR' });

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

      // TODO: add error description
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
}
