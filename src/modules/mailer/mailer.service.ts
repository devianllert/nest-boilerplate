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
      // TODO: add redis and send /verify/${token}
      const link = `${this.configService.get<string>('CLIENT_URL')}/verify?email=${email}&token=${token}`;

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
}
