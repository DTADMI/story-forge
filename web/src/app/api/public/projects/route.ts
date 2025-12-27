import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(parseInt(searchParams.get('take') || '20', 10), 50);
  const cursor = searchParams.get('cursor') || undefined;

  const where = {
      OR: [{isPublic: true}, {defaultScope: 'PUBLIC_ANYONE' as any}],
  };

  const items = await prisma.project.findMany({
    where,
    take: take + 1,
    orderBy: { updatedAt: 'desc' },
      ...(cursor ? {cursor: {id: cursor}, skip: 1} : {}),
  });

  const hasMore = items.length > take;
  const data = hasMore ? items.slice(0, take) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;

  return NextResponse.json({ items: data, nextCursor });
}
