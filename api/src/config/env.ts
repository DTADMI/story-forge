// Centralized environment reader for API with Zod validation
import {z} from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  API_JWT_SECRET: z.string().min(10, 'API_JWT_SECRET must be set'),
  // Stripe (optional if payments flag is off)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().optional(),
    STRIPE_PRICE_PREMIUM_YEARLY: z.string().optional(),
});

type Env = z.infer<typeof EnvSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;
    if (process.env.NODE_ENV === 'test' && !process.env.API_JWT_SECRET) {
        process.env.API_JWT_SECRET = 'test-secret-1234567890';
    }
  _env = EnvSchema.parse(process.env);
  return _env;
}

export const env = new Proxy({} as any, {
  get(_t, prop: string) {
    const e = getEnv();
    if (prop === 'nodeEnv') return e.NODE_ENV;
    if (prop === 'apiJwtSecret') return e.API_JWT_SECRET;
    return (e as any)[prop];
  },
});

export function assertEnv() {
  // Will throw with helpful message if invalid
  getEnv();
}
