import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

import { MailOptions } from './mailOptions.interface';
import { MailOptionsFactory } from './mailOptionsFactory.interface';

export interface MailAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<MailOptionsFactory>;
  useExisting?: Type<MailOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MailOptions> | MailOptions;
}
