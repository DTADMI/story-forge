import {NextRequest, NextResponse} from 'next/server';
import {flags} from '@/lib/flags';

export async function POST(req: NextRequest) {
    if (!flags.payments) return new NextResponse('Not Found', {status: 404});
    const api = process.env.API_URL || 'http://localhost:3001';
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${api}/billing/checkout`, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, {status: res.status});
}
