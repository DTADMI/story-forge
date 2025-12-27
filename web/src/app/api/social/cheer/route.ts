import {NextResponse} from 'next/server';
import {apiFetch} from '@/lib/api';

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const res = await apiFetch('/social/cheer', {
        method: 'POST',
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const msg = await res.text();
        return new NextResponse(msg || 'Cheer failed', {status: res.status});
    }
    const data = await res.json();
    return NextResponse.json(data);
}
