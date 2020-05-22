import { DynamicModule, Module } from '@nestjs/common';

import { MailOptions } from './interfaces/mailOptions.interface';
import { MailAsyncOptions } from './interfaces/mailAsyncOptions.interface';

import { MailCoreModule } from './mail.core.module';

@Module({})
export class MailModule {
  public static forRoot(options: MailOptions): DynamicModule {
    return {
      module: MailModule,
      imports: [MailCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: MailAsyncOptions): DynamicModule {
    return {
      module: MailModule,
      imports: [MailCoreModule.forRootAsync(options)],
    };
  }
}
