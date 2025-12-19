import type {NextAuthOptions} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {PrismaAdapter} from '@auth/prisma-adapter';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {strategy: 'jwt'},
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type: 'password'}
            },
            authorize: async (credentials) => {
                const email = credentials?.email?.toString().toLowerCase().trim();
                const password = credentials?.password?.toString() ?? '';
                if (!email || !password) return null;
                const user = await prisma.user.findFirst({where: {email}});
                if (!user?.passwordHash) return null;
                const ok = await bcrypt.compare(password, user.passwordHash);
                if (!ok) return null;
                return {id: user.id, name: user.name ?? undefined, email: user.email ?? undefined} as any;
            }
        })
    ],
    pages: {
        signIn: '/signin'
    },
    callbacks: {
        async jwt({token, user}) {
            if (user?.id) (token as any).uid = (user as any).id;
            return token;
        },
        async session({session, token}) {
            if (session.user && (token as any)?.uid) (session.user as any).id = (token as any).uid as string;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};
