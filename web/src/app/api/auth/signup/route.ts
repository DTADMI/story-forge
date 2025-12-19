import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcrypt';
import {z} from 'zod';

const SignUpSchema = z.object({
    email: z.string().email().max(320),
    password: z.string().min(8).max(256),
    name: z.string().trim().max(120).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = SignUpSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {error: 'Invalid input', details: parsed.error.flatten()},
                {status: 400}
            );
        }

        const email = parsed.data.email.toLowerCase().trim();
        const password = parsed.data.password;
        const name = parsed.data.name?.trim() || null;

        const existing = await prisma.user.findFirst({where: {email}});
        if (existing) {
            return NextResponse.json({error: 'Email already in use'}, {status: 409});
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
            },
        });

        return NextResponse.json({ok: true}, {status: 201});
    } catch (err) {
        return NextResponse.json({error: 'Unexpected error'}, {status: 500});
    }
}
