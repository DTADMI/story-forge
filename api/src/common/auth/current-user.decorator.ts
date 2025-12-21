import {createParamDecorator, ExecutionContext} from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<{ user?: { id: string } }>();
        return req.user;
    }
);
