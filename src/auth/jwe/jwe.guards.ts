import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { JweService } from 'src/auth/jwe/jwe.service';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/logger/logger.service';

// https://docs.nestjs.com/recipes/passport#enable-authentication-globally
export const IS_PUBLIC_ROUTE_KEY = 'isPublicRoute';
export const Public = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true);

@Injectable()
export class JweAuthGuard extends AuthGuard('jwe') {
    constructor(
        private configService: ConfigService,
        private jweService: JweService,
        private loggerService: LoggerService,
        private reflector: Reflector,
    ) {
        super();
    }

    // https://docs.nestjs.com/recipes/passport#extending-guards
    // can implement custom authentication logic here, for example
    // call super.logIn(request) to establish a session.
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    /*
    // additional options can be passed to JweStrategy.authenticate here
    getAuthenticateOptions(_context: ExecutionContext): object {
        return { foo: 'bar' };
    }
    */

    /*
    // can throw an exception here based on info or err arguments
    handleRequest<TUser = any>(
        err: any,
        user: any,
        info: any,
        context: ExecutionContext,
        status?: any,
    ): TUser {
        // this is called after the JWE has been validated.
        // this is the final opportunity to do something based
        // on the user or info arguments before the route
        // handler is called.

        return super.handleRequest(err, user, info, context, status);
    }
    */
}

// Register this in the AuthModule's providers array to
// put all endpoints behind the JweAuthGuard. Endpoints
// can be excepted by using @Public().
//
// Per the docs, a global auth guard can be registered in
// any module, so stick it in AuthModule since that's what
// it's most closely related to.
//
// If AppJweAuthGuard is not used, individual endpoints
// can use JweAuthGuard with @UseGuards(JweAuthGuard).
export const AppJweAuthGuard = {
    provide: APP_GUARD,
    useClass: JweAuthGuard,
};
