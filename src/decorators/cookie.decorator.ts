import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parse } from 'cookie';
import { Request } from 'express';

type CookieData = string
  | {
    [key: string]: string;
  }
  | undefined;

export const Cookie = createParamDecorator((data: string | undefined, ctx: ExecutionContext): CookieData => {
  const request = ctx.switchToHttp().getRequest<Request>();

  if (!request.headers.cookie) return undefined;

  const cookie = parse(request.headers.cookie);

  if (data) return cookie[data];

  return cookie;
});
