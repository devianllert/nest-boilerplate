import path from 'path';
import { Test, TestingModule } from '@nestjs/testing';

import MailMessage from 'nodemailer/lib/mailer/mail-message';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { MAILER_OPTIONS } from './mail.constants';
import { MailOptions } from './interfaces/mailOptions.interface';

import { MailService } from './mail.service';

import { HandlebarsCompiler } from './compilers/handlebars.compiler';
import { MustacheCompiler } from './compilers/mustache.compiler';

async function getMailServiceForOptions(options: MailOptions): Promise<MailService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        name: MAILER_OPTIONS,
        provide: MAILER_OPTIONS,
        useValue: options,
      },
      MailService,
    ],
  }).compile();

  const service = module.get<MailService>(MailService);

  return service;
}

/**
 * Common testing code for spying on the SMTPTransport's send() implementation
 */
function spyOnSmtpSend(onMail: (mail: MailMessage) => void) {
  return jest
    .spyOn(SMTPTransport.prototype, 'send')
    .mockImplementation((
      mail: MailMessage,
      callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void,
    ): void => {
      onMail(mail);
      callback(null, {
        envelope: {
          from: mail.data.from as string,
          to: [mail.data.to as string],
        },
        messageId: 'ABCD',
      });
    });
}

describe('MailService', () => {
  it('should not be defined if a transport is not provided', async () => {
    await expect(getMailServiceForOptions({})).rejects.toMatchInlineSnapshot(
      '[Error: Make sure to provide a nodemailer transport configuration.]',
    );
  });

  it('should accept a smtp transport string', async () => {
    const service = await getMailServiceForOptions({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBeInstanceOf(SMTPTransport);
  });

  it('should accept smtp transport options', async () => {
    const service = await getMailServiceForOptions({
      transport: {
        secure: true,
        auth: {
          user: 'user@domain.com',
          pass: 'pass',
        },
        options: {
          host: 'smtp.domain.com',
        },
      },
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBeInstanceOf(SMTPTransport);
  });

  it('should accept a smtp transport instance', async () => {
    const transport = new SMTPTransport({});
    const service = await getMailServiceForOptions({
      transport,
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBe(transport);
  });

  it('should send emails with nodemailer', async () => {
    let lastMail: MailMessage;

    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailServiceForOptions({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    });

    await service.sendMail({
      from: 'test@example.test',
      to: 'test1@example.test',
      subject: 'Test',
      html: 'This is test.',
    });

    expect(send).toHaveBeenCalled();

    expect(lastMail!.data.from).toBe('test@example.test');
    expect(lastMail!.data.to).toBe('test1@example.test');
    expect(lastMail!.data.subject).toBe('Test');
    expect(lastMail!.data.html).toBe('This is test.');
  });

  it('should use mailOptions.defaults when send emails', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailServiceForOptions({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      defaults: {
        from: 'test@example.test',
      },
    });

    await service.sendMail({
      to: 'test1@example.test',
      subject: 'Test',
      html: 'This is test.',
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail!.data.from).toBe('test@example.test');
  });

  it('should compile template with the handlebars adapter', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        compiler: new HandlebarsCompiler(),
      },
    });

    await service.sendMail({
      from: 'test@example.test',
      to: 'test1@example.test',
      subject: 'Test',
      template: path.join(__dirname, '/test-templates/handlebars-template'),
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail!.data.from).toBe('test@example.test');
    expect(lastMail!.data.html).toBe('<p>Handlebars test template. by Nest-modules TM</p>');
  });

  it('should compile template with the handlebars adapter', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        compiler: new MustacheCompiler(),
      },
    });

    await service.sendMail({
      from: 'test@example.test',
      to: 'test1@example.test',
      subject: 'Test',
      template: path.join(__dirname, '/test-templates/mustache-template'),
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail!.data.from).toBe('test@example.test');
    expect(lastMail!.data.html).toBe('<p>Mustache test template. by Nest-modules TM</p>');
  });
});
