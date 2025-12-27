import {prisma} from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PublicFeedPage() {
  const projects = await prisma.project.findMany({
    where: {
        OR: [{isPublic: true}, {defaultScope: 'PUBLIC_ANYONE' as any}],
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
      select: {id: true, title: true, description: true, updatedAt: true},
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Public Stories</h1>
      <p>Explore recently shared projects from the community.</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map((p) => (
            <li
                key={p.id}
                style={{
                    margin: '16px 0',
                    padding: 12,
                    border: '1px solid #eee',
                    borderRadius: 8,
                }}
            >
            <h3 style={{ margin: '0 0 8px' }}>{p.title}</h3>
                {p.description && (
                    <p style={{margin: 0, color: '#555'}}>{p.description}</p>
                )}
            <small>Updated {new Date(p.updatedAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
