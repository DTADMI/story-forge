import { z } from "zod";

const WebEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_FEATURE_PAYMENTS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_AI_ASSIST: z.string().optional(),
  NEXT_PUBLIC_FEATURE_AI_WRITING_SUGGESTIONS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_AI_CHARACTER: z.string().optional(),
  NEXT_PUBLIC_FEATURE_AI_PLOT: z.string().optional(),
  NEXT_PUBLIC_FEATURE_AI_STYLE: z.string().optional(),
  NEXT_PUBLIC_FEATURE_AI_RESEARCH: z.string().optional(),
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
