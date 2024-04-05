import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ? request.user : null;
  },
);


export interface SocialUserAfterAuth {
  email: string;
  password: string;
  nickname: string;
}

