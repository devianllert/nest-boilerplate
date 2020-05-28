import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
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

import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { MailerService } from '../mailer/mailer.service';
import { LoggerService } from '../logger/logger.service';

import { detect } from '../../utils/parseUserAgent';

import { User } from '../users/users.entity';
import { Tokens } from './interfaces/tokens.interface';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.loggerService.setContext('AuthService');
  }

  /**
   * Create access and refresh tokens
   *
   * @param payload payload for generating jwt
   *
   * @return an object with `accessToken` and `refreshToken`
   */
  private createTokens(payload: string | object | Buffer): Tokens {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuid.v4();

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Create `emailToken` and send email verification to a user
   *
   * @param user `User` object
   *
   * @return a promise
   */
  private async sendVerification(user: User): Promise<void> {
    // TODO?: create token in mailerService
    // We can create jwt token or can create UUID token and write it to something like Redis
    const emailToken = sign({ email: user.email, id: user.id }, this.configService.get('token.EMAIL_SECRET')!);
    // const resetToken = uuid.v4();

    await this.mailerService.sendRegistrationMail(user.email, user.username, emailToken);
  }

  /**
   * Resend email verification
   *
   * @param email user email
   *
   * @return a promise
   */
  async resendVerifyEmail(email: string): Promise<void> {
    const user = await this.usersService.findByEmailOrUsername(email);

    if (!user || user.isVerified) throw new BadRequestException();

    // TODO?: send different mail for resending
    this.sendVerification(user);
  }

  /**
   * Verify a user email
   *
   * @param token email token
   *
   * @return a promise
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const { email } = verify(token, this.configService.get('token.EMAIL_SECRET')!) as { email: string };

      const user = await this.usersService.findByEmailOrUsername(email);

      // TODO?: throw an error if user not found
      if (!user) return;

      await this.usersService.updateVerifyEmail(user.email, true);
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

  /**
   * Register a new user in system.
   * Send email verification
   *
   * @param email user email
   * @param username user username
   * @param password user password
   *
   * @return a promise to be either resolved with the `User` object or rejected with an error
   */
  async register(email: string, username: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.createUser(email, username, password);

      // Don't wait a message
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

  /**
   * Login a user to system and create session
   *
   * @param ip ip address
   * @param userAgent browser user-agent
   * @param emailOrUsername user email or username
   * @param password user password
   *
   * @return a promise to be either resolved with the `tokens` or rejected with an error
   */
  async login(
    ip: string,
    userAgent: string,
    emailOrUsername: string,
    password: string,
  ): Promise<Tokens> {
    const user = await this.usersService.validateUser(emailOrUsername, password);

    if (!user) {
      throw new BadRequestException('LOGIN_ERROR');
    }

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

  /**
   * Logout and delete session by user id and token
   *
   * @param userId user id
   * @param token refresh token
   *
   * @return a promise
   */
  async logout(userId: number, token: string): Promise<void> {
    await this.sessionsService.clearSessionByToken(userId, token);
  }

  /**
   * Verify refresh token and create a new object with refresh and access tokens
   * then update session with this token in database
   *
   * @param token refresh token
   *
   * @return a promise to be either resolved with the `tokens` object or rejected with an `error`
   */
  async refreshTokens(token: string): Promise<Tokens> {
    const session = await this.sessionsService.findSession(token);

    if (!session) {
      throw new UnauthorizedException();
    }

    const isExpire = Math.round(new Date().getTime() / 1000) > session.expiresIn;

    if (isExpire) {
      await this.sessionsService.clearSessionByToken(session.userId, token);

      throw new UnauthorizedException('TOKEN_EXPIRED');
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

  /**
   * Find a user by email or username, create token and send reset password mail
   *
   * @param emailOrUsername user email or username
   *
   * @return a promise
   */
  async forgot(emailOrUsername: string): Promise<void> {
    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new BadRequestException();
    }

    // We need to create jwt/UUID token and write it to something like Redis
    const resetToken = sign({ email: user.email, id: user.id }, this.configService.get('token.RESET_SECRET')!);
    // const resetToken = uuid.v4();

    // Don't wait a message
    this.mailerService.sendResetPasswordMail(user.email, user.username, resetToken);
  }

  /**
   * Verify reset token and change the user's password
   *
   * @param token reset token
   * @param password user password
   *
   * @return a promise
   */
  async reset(token: string, password: string): Promise<void> {
    try {
      const { email } = verify(token, this.configService.get('token.RESET_SECRET')!) as { email: string };

      const user = await this.usersService.findByEmailOrUsername(email);

      if (!user) return;

      await this.usersService.updatePassword(user.email, password);
      await this.sessionsService.clearAllSessions(user.id);

      // Don't wait a message
      this.mailerService.sendPasswordChangedMail(user.email, user.username);
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
