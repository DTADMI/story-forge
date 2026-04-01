import {NextResponse} from 'next/server';
import {apiFetch} from '@/lib/api';

export async function PATCH(
    req: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const res = await apiFetch(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const msg = await res.text();
        return new NextResponse(msg || 'Failed to update project', {
            status: res.status,
        });
    }

    const data = await res.json();
    return NextResponse.json(data);
}
