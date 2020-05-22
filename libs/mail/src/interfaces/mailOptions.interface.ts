import { Transport, TransportOptions } from 'nodemailer';

import SMTPTransport from 'nodemailer/lib/smtp-transport';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SendmailTransport from 'nodemailer/lib/sendmail-transport';
import StreamTransport from 'nodemailer/lib/stream-transport';
import JSONTransport from 'nodemailer/lib/json-transport';
import SESTransport from 'nodemailer/lib/ses-transport';

type Options =
  | SMTPTransport.Options
  | SMTPPool.Options
  | SendmailTransport.Options
  | StreamTransport.Options
  | JSONTransport.Options
  | SESTransport.Options
  | TransportOptions;

type TransportType =
  | Options
  | SMTPTransport
  | SMTPPool
  | SendmailTransport
  | StreamTransport
  | JSONTransport
  | SESTransport
  | Transport
  | string;

export interface TemplateCompiler {
  compile(mail: any, callback: (err?: any, body?: string) => any, options: MailOptions): void;
}

export interface Template {
  dir?: string;
  compiler?: TemplateCompiler;
  options?: { [name: string]: any };
}

export interface MailOptions {
  defaults?: Options;
  transport?: TransportType;
  template?: Template;
  options?: { [name: string]: any };
}
