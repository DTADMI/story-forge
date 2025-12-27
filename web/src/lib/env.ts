import {z} from 'zod';

const WebEnvSchema = z.object({
    NEXTAUTH_SECRET: z.string().min(10),
    NEXTAUTH_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    API_URL: z.string().url(),
    API_JWT_SECRET: z.string().min(10),
    // Public flags are optional here because Next injects them at build time
    NEXT_PUBLIC_FEATURE_PAYMENTS: z.string().optional(),
    NEXT_PUBLIC_FEATURE_AI_ASSIST: z.string().optional(),
    NEXT_PUBLIC_FEATURE_PROJECTS_V2: z.string().optional(),
    NEXT_PUBLIC_FEATURE_WELLBEING: z.string().optional(),
    NEXT_PUBLIC_FEATURE_DESIGN_SYSTEM_V2: z.string().optional(),
});

let _env: z.infer<typeof WebEnvSchema> | null = null;

export function getWebEnv() {
    if (_env) return _env;
    _env = WebEnvSchema.parse(process.env);
    return _env;
}
