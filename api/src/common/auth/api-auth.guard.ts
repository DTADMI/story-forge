import {CanActivate, ExecutionContext, Injectable, UnauthorizedException,} from '@nestjs/common';
import {Request} from 'express';
import jwt from 'jsonwebtoken';
import {env} from '../../config/env';

export interface ApiJwtPayload {
    uid: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class ApiAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context
            .switchToHttp()
            .getRequest<Request & { user?: { id: string } }>();
        const header = req.headers['authorization'] || req.headers['Authorization'];
        if (!header || Array.isArray(header))
            throw new UnauthorizedException('Missing Authorization header');
        const [scheme, token] = header.split(' ');
        if (scheme?.toLowerCase() !== 'bearer' || !token)
            throw new UnauthorizedException('Invalid Authorization header');
        try {
            const decoded = jwt.verify(token, env.apiJwtSecret) as ApiJwtPayload;
            if (!decoded?.uid) throw new UnauthorizedException('Invalid token');
            req.user = {id: decoded.uid};
            return true;
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
