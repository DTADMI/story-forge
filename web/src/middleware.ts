import {type NextRequest, NextResponse} from 'next/server';

export function middleware(req: NextRequest) {
    // Basic security headers for all routes
    const res = NextResponse.next();
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-XSS-Protection', '0');
    // Minimal CSP; refined later. Allows next/image and same-origin.
    const csp = [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self' 'strict-dynamic' 'unsafe-inline'",
        "connect-src 'self'",
        "font-src 'self' data:",
        "frame-ancestors 'none'",
    ].join('; ');
    res.headers.set('Content-Security-Policy', csp);
    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
