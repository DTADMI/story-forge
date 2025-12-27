'use client';

import {useState} from 'react';
import {Button} from '../ui/button';

interface CheerButtonProps {
    targetUserId: string;
}

export function CheerButton({targetUserId}: CheerButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function cheer() {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/social/cheer', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId: targetUserId}),
            });
            if (res.ok) {
                setMessage('Sent Cheer! 🖋️');
                setTimeout(() => setMessage(null), 3000);
            } else {
                const text = await res.text();
                setMessage(text || 'Failed to cheer');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <Button
                onClick={cheer}
                disabled={isLoading}
                variant="outline"
                className="hover:border-brand hover:text-brand"
            >
                {isLoading ? '...' : 'Cheer 🖋️'}
            </Button>
            {message && <span className="text-xs font-medium animate-pulse">{message}</span>}
        </div>
    );
}
