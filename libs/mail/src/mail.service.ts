import { Injectable, Inject } from '@nestjs/common';
import { createTransport, SentMessageInfo, Transporter } from 'nodemailer';

import { MAILER_OPTIONS } from './mail.constants';

import { MailOptions } from './interfaces/mailOptions.interface';
import { ISendMailOptions } from './interfaces/sendMailOptions.interface';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(@Inject(MAILER_OPTIONS) private readonly mailOptions: MailOptions) {
    if (!mailOptions.transport || Object.keys(mailOptions.transport).length <= 0) {
      throw new Error('Make sure to provide a nodemailer transport configuration.');
    }

    this.transporter = createTransport(this.mailOptions.transport, this.mailOptions.defaults);

    const templateCompiler = this.mailOptions.template?.compiler;

    if (templateCompiler) {
      this.transporter.use('compile', (mail, callback) => {
        if (mail.data.html) {
          return callback();
        }

        return templateCompiler.compile(mail, callback, this.mailOptions);
      });
    }
  }

  public async sendMail(sendMailOptions: ISendMailOptions): Promise<SentMessageInfo> {
    const result = await this.transporter.sendMail(sendMailOptions);

    return result;
  }
}
