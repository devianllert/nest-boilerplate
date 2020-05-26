/* eslint-disable import/no-unresolved */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailService } from '@app/mail';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async sendRegistrationMail(email: string, username: string, token: string) {
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
      console.log(error);
    }
  }

  async sendResetPasswordMail(email: string, username: string, token: string) {
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
      console.log(error);
    }
  }

  async sendPasswordChangedMail(email: string, username: string) {
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
      console.log(error);
    }
  }
}
