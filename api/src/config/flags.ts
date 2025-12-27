// Env-based feature flags for the NestJS API
// Read from API_FEATURE_* environment variables at runtime.

export type ApiFlagKeys =
  | 'payments'
  | 'aiAssist'
  | 'projectsV2'
  | 'wellbeing'
  | 'designSystemV2';

export type ApiFlags = Record<ApiFlagKeys, boolean>;

function readBool(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v == null) return fallback;
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

export const apiFlags: ApiFlags = {
  payments: readBool('API_FEATURE_PAYMENTS', false),
  aiAssist: readBool('API_FEATURE_AI_ASSIST', false),
  projectsV2: readBool('API_FEATURE_PROJECTS_V2', false),
  wellbeing: readBool('API_FEATURE_WELLBEING', true),
  designSystemV2: readBool('API_FEATURE_DESIGN_SYSTEM_V2', true),
};

export function isApiFlagEnabled(key: keyof ApiFlags): boolean {
  return apiFlags[key];
}
