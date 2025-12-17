import { NextResponse } from 'next/server';
import { flags } from '@/lib/flags';

export function GET() {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }
  return NextResponse.json({ env, flags });
}
