import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { User } from '../modules/users/users.entity';

export const GetUser = createParamDecorator((data: keyof User, ctx: ExecutionContext): User | any => {
  const request = ctx.switchToHttp().getRequest<Request>();

  const user = request.user as User;

  if (data) {
    return user && user[data as keyof User];
  }

  return user;
});
