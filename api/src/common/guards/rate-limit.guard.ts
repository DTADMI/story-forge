import {CanActivate, ExecutionContext, Injectable, TooManyRequestsException} from '@nestjs/common';

type Key = string;
type Bucket = { tokens: number; lastRefill: number };

const store = new Map<Key, Bucket>();

function allow(key: Key, capacity: number, refillPerSec: number): boolean {
    const now = Date.now();
    const bucket = store.get(key) || {tokens: capacity, lastRefill: now};
    // Refill
    const elapsed = (now - bucket.lastRefill) / 1000;
    const refill = Math.floor(elapsed * refillPerSec);
    if (refill > 0) {
        bucket.tokens = Math.min(capacity, bucket.tokens + refill);
        bucket.lastRefill = now;
    }
    if (bucket.tokens > 0) {
        bucket.tokens -= 1;
        store.set(key, bucket);
        return true;
    }
    store.set(key, bucket);
    return false;
}

@Injectable()
export class ReadRateLimitGuard implements CanActivate {
    private capacity = 300; // tokens per minute
    private refillPerSec = this.capacity / 60; // uniform refill
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<{ ip?: string; user?: { id: string } }>();
        const uid = req.user?.id || 'anon';
        const ip = (req as any).ip || 'unknown';
        const key = `read:${uid}:${ip}`;
        if (!allow(key, this.capacity, this.refillPerSec)) {
            throw new TooManyRequestsException('Read rate limit exceeded');
        }
        return true;
    }
}

@Injectable()
export class WriteRateLimitGuard implements CanActivate {
    private capacity = 60; // tokens per minute
    private refillPerSec = this.capacity / 60;

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<{ ip?: string; user?: { id: string } }>();
        const uid = req.user?.id || 'anon';
        const ip = (req as any).ip || 'unknown';
        const key = `write:${uid}:${ip}`;
        if (!allow(key, this.capacity, this.refillPerSec)) {
            throw new TooManyRequestsException('Write rate limit exceeded');
        }
        return true;
    }
}
