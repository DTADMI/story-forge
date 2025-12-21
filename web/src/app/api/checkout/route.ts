import {NextResponse} from 'next/server';
import {apiFetch} from '@/lib/api';

export async function POST(req: Request) {
    const form = await req.formData().catch(() => null);
    const plan = (form?.get('plan') as string) || 'monthly';
    const successUrl = form?.get('successUrl') as string | undefined;
    const cancelUrl = form?.get('cancelUrl') as string | undefined;

    const res = await apiFetch('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({plan, successUrl, cancelUrl})
    });

    if (!res.ok) {
        const msg = await res.text();
        return new NextResponse(msg || 'Checkout failed', {status: res.status});
    }
    const data = await res.json();
    const url = data?.url as string | undefined;
    if (!url) return new NextResponse('No checkout URL', {status: 500});
    return NextResponse.redirect(url, {status: 303});
}
