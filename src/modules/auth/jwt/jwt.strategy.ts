import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UserRole } from '../../users/users.entity';
import { UsersService } from '../../users/users.service';

interface JWTPayload {
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.ACCESS_SECRET'),
    });
  }

  async validate(payload: JWTPayload) {
    const user = await this.usersService.findByEmailOrUsername(payload.email);

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
