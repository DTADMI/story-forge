'use client';
import * as React from 'react';
import {Button} from '@/components/ui/button';

type Plan = 'monthly' | 'yearly' | 'lifetime';

export function SubscribeButton({plan, disabled}: { plan: Plan; disabled?: boolean }) {
    const [loading, setLoading] = React.useState(false);
    return (
        <Button
            className="w-full"
            disabled={disabled || loading}
            aria-disabled={disabled || loading}
            onClick={async () => {
                if (disabled) return;
                try {
                    setLoading(true);
                    const res = await fetch('/api/billing/checkout', {
                        method: 'POST',
                        headers: {'content-type': 'application/json'},
                        body: JSON.stringify({plan})
                    });
                    const data = await res.json();
                    if (res.ok && data?.url) {
                        window.location.href = data.url as string;
                    } else {
                        alert(data?.message || 'Checkout not available yet.');
                    }
                } catch (e) {
                    console.error(e);
                    alert('Failed to start checkout.');
                } finally {
                    setLoading(false);
                }
            }}
        >
            {loading ? 'Processing…' : plan === 'lifetime' ? 'Buy lifetime' : plan === 'yearly' ? 'Subscribe yearly' : 'Subscribe monthly'}
        </Button>
    );
}
