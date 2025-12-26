'use client';

import {useState} from 'react';
import {Button} from '../ui/button';

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
}

export function FollowButton({targetUserId, initialIsFollowing}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    async function toggle() {
        setIsLoading(true);
        try {
            const res = await fetch('/api/social/follow', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId: targetUserId})
            });
            if (res.ok) {
                const data = await res.json();
                setIsFollowing(data.following);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            onClick={toggle}
            disabled={isLoading}
            variant={isFollowing ? 'outline' : 'default'}
        >
            {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
    );
}
