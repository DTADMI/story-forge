import {NextRequest, NextResponse} from 'next/server';
import {flags} from '@/lib/flags';

export async function POST(req: NextRequest) {
    if (!flags.payments) {
        return new NextResponse('Not found', {status: 404});
    }
    const api = process.env.API_URL;
    if (!api) {
        return NextResponse.json({error: 'API_URL not configured'}, {status: 500});
    }
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${api}/billing/checkout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, {status: res.status});
}
