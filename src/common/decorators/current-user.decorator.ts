import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../enums';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser | null => {
  return ctx.switchToHttp().getRequest().user ?? null;
});
