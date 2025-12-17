// Simple env-based feature flags for the web app
// Read from NEXT_PUBLIC_FEATURE_* variables so they are available client-side.

type FlagKeys =
  | 'payments'
  | 'aiAssist'
  | 'projectsV2'
  | 'wellbeing'
  | 'designSystemV2';

export type Flags = Record<FlagKeys, boolean>;

function readBool(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v == null) return fallback;
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

export const flags: Flags = {
  payments: readBool('NEXT_PUBLIC_FEATURE_PAYMENTS', false),
  aiAssist: readBool('NEXT_PUBLIC_FEATURE_AI_ASSIST', false),
  projectsV2: readBool('NEXT_PUBLIC_FEATURE_PROJECTS_V2', false),
  wellbeing: readBool('NEXT_PUBLIC_FEATURE_WELLBEING', true),
  designSystemV2: readBool('NEXT_PUBLIC_FEATURE_DESIGN_SYSTEM_V2', true)
};

export function isEnabled(key: keyof Flags): boolean {
  return flags[key];
}
