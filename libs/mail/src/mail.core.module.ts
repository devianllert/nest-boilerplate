import {
  DynamicModule,
  Module,
  Global,
  Provider,
} from '@nestjs/common';

import { MAILER_OPTIONS } from './mail.constants';

import { MailOptions } from './interfaces/mailOptions.interface';
import { MailAsyncOptions } from './interfaces/mailAsyncOptions.interface';
import { MailOptionsFactory } from './interfaces/mailOptionsFactory.interface';

import { MailService } from './mail.service';

@Global()
@Module({})
export class MailCoreModule {
  public static forRoot(options: MailOptions): DynamicModule {
    const MailerOptionsProvider: Provider = {
      name: MAILER_OPTIONS,
      provide: MAILER_OPTIONS,
      useValue: options,
    };

    return {
      module: MailCoreModule,
      providers: [MailerOptionsProvider, MailService],
      exports: [MailService],
    };
  }

  public static forRootAsync(options: MailAsyncOptions): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);

    return {
      module: MailCoreModule,
      providers: [...providers, MailService],
      imports: options.imports,
      exports: [MailService],
    };
  }

  private static createAsyncProviders(options: MailAsyncOptions): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });
    }

    return providers;
  }

  private static createAsyncOptionsProvider(options: MailAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        name: MAILER_OPTIONS,
        provide: MAILER_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: MAILER_OPTIONS,
      useFactory: async (optionsFactory: MailOptionsFactory) => optionsFactory.createMailerOptions(),
      useExisting: options.useExisting,
      useClass: options.useClass,
    };
  }
}
