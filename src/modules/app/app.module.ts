import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from '../../config/configuration';

import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['development.env'],
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    SessionsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
