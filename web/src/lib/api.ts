import jwt from 'jsonwebtoken';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getWebEnv} from '@/lib/env';

// Creates a short-lived API token with the current user's id.
async function createApiToken(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    const secret = process.env.API_JWT_SECRET;
    if (!userId || !secret) return null;
    // 10 minutes expiry
    return jwt.sign({uid: userId}, secret, {
        algorithm: 'HS256',
        expiresIn: '10m',
    });
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  // Validate env on first use
  const env = getWebEnv();
  const api = env.API_URL;
    if (!api) throw new Error('Missing API_URL');
    const token = await createApiToken();
    const headers = new Headers(init.headers as HeadersInit);
    headers.set(
        'Content-Type',
        headers.get('Content-Type') || 'application/json'
    );
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${api}${input.startsWith('/') ? '' : '/'}${input}`, {
        ...init,
        headers,
    });
}
