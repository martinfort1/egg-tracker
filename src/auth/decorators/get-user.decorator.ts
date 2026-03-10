import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator(
    ( data: unknown, ctx: ExecutionContext ) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data as string] : user;
    }
)