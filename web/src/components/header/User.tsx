'use client';
import {signOut, useSession} from 'next-auth/react';
import Link from 'next/link';

export default function HeaderUser() {
  const { data, status } = useSession();
    if (status === 'loading') return <span/>;
  const user = data?.user;
  if (!user) {
      return (
          <Link href="/signin" style={{fontWeight: 600}}>
              Sign in
          </Link>
      );
  }
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{color: '#374151', fontSize: 14}}>{user.email}</span>
      <button
          onClick={() => signOut({callbackUrl: '/'})}
          style={{
              border: 0,
              background: 'transparent',
              color: '#0e3fa9',
              cursor: 'pointer',
          }}
      >
        Sign out
      </button>
    </div>
  );
}
