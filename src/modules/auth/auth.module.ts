import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { MailerModule } from '../mailer/mailer.module';
import { LoggerModule } from '../logger/logger.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [
    LoggerModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('token.ACCESS_SECRET'),
        signOptions: {
          expiresIn: parseInt(configService.get('token.ACCESS_TIMEOUT')!, 10),
        },
      }),
    }),
    UsersModule,
    SessionsModule,
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
