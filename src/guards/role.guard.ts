import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { User, UserRole } from '../modules/users/users.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());

    if (!roles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user as User;

    return user && user.role && roles.some((role) => role === user.role);
  }
}
