import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, genSalt, hash } from 'bcrypt';
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
    private configService: ConfigService,
  ) {}

  async validateUser(payload: UserLoginDTO): Promise<User> {
    const { emailOrUsername, password } = payload;

    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);

    if (!(user && (await compare(password, user.password)))) {
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

    // ...verify token

    this.usersService.updateVerifyEmail(user.id, true);
  }

  async resendVerifyEmail(email: string) {
    const user = await this.usersService.findByEmailOrUsername(email);

    if (!user || user.isVerified) throw new BadRequestException();

    this.sendVerification(user.email, user.username);
  }

  async sendVerification(email: string, username: string) {
    const emailToken = uuid.v4();

    this.mailerService.sendRegistrationMail(
      email,
      username,
      emailToken,
    );
  }

  async register(payload: UserRegisterDTO): Promise<User> {
    const salt = await genSalt(10);
    const hashedPassword = await hash(payload.password, salt);

    const user = await this.usersService.createUser({
      email: payload.email,
      username: payload.username,
      password: hashedPassword,
    });

    this.sendVerification(user.email, user.username);

    return user;
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
}
