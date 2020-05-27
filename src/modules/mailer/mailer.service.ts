/* eslint-disable import/no-unresolved */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailService } from '@app/mail';

import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('MailerService');
  }

  async sendRegistrationMail(email: string, username: string, token: string): Promise<void> {
    try {
      const link = `${this.configService.get<string>('CLIENT_URL')}/verify/${token}`;

      await this.mailService.sendMail({
        priority: 'high',
        to: email,
        subject: 'Registration',
        template: 'email-verification',
        context: {
          username,
          link,
        },
      });
    } catch (error) {
      this.loggerService.error(error.message, error.trace, error.context);
    }
  }

  async sendResetPasswordMail(email: string, username: string, token: string): Promise<void> {
    try {
      const link = `${this.configService.get<string>('CLIENT_URL')}/reset/${token}`;

      await this.mailService.sendMail({
        priority: 'high',
        to: email,
        subject: 'Reset password',
        template: 'reset-password',
        context: {
          username,
          link,
        },
      });
    } catch (error) {
      this.loggerService.error(error.message, error.trace, error.context);
    }
  }

  async sendPasswordChangedMail(email: string, username: string): Promise<void> {
    try {
      await this.mailService.sendMail({
        priority: 'high',
        to: email,
        subject: 'Password changed',
        template: 'password-changed',
        context: {
          username,
        },
      });
    } catch (error) {
      this.loggerService.error(error.message, error.trace, error.context);
    }
  }
}
