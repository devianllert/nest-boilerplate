import { MailOptions } from './mailOptions.interface';

export interface MailOptionsFactory {
  createMailerOptions(): Promise<MailOptions> | MailOptions;
}
