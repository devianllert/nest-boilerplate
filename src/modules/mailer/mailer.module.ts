/* eslint-disable import/no-unresolved */
import path from 'path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailModule, MustacheCompiler } from '@app/mail';

import { MailerService } from './mailer.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'gmail',
        },
        defaults: {
          from: config.get('mail.MAIL_FROM'),
          secure: true,
          auth: {
            user: config.get('mail.MAIL_USER_NAME'),
            pass: config.get('mail.MAIL_USER_PASS'),
          },
        },
        template: {
          dir: path.join(__dirname, '../templates'),
          compiler: new MustacheCompiler(),
        },
      }),
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
