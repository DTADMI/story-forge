export const SUBSCRIPTION_LIMITS = {
  free: {
    maxProjects: 3,
    maxCharacters: 10,
    aiRequestsPerDay: 0,
    competitions: false,
    analytics: false,
  },
  explorer: {
    maxProjects: 10,
    maxCharacters: 50,
    aiRequestsPerDay: 10,
    competitions: true,
    analytics: false,
  },
  creator: {
    maxProjects: -1,
    maxCharacters: -1,
    aiRequestsPerDay: 100,
    competitions: true,
    analytics: true,
  },
  lifetime: {
    maxProjects: -1,
    maxCharacters: -1,
    aiRequestsPerDay: 500,
    competitions: true,
    analytics: true,
  },
} as const;

type SubscriptionTier = keyof typeof SUBSCRIPTION_LIMITS;
type UserForPerms = {
  subscriptionTier: string;
  role: string;
  _count?: { projects: number; characters: number };
};

function getLimits(tier: string) {
  return SUBSCRIPTION_LIMITS[tier as SubscriptionTier] ?? SUBSCRIPTION_LIMITS.free;
}

export function canCreateProject(user: UserForPerms): boolean {
  const limits = getLimits(user.subscriptionTier);
  if (limits.maxProjects === -1) return true;
  const count = user._count?.projects ?? 0;
  return count < limits.maxProjects;
}

export function canCreateCharacter(user: UserForPerms): boolean {
  const limits = getLimits(user.subscriptionTier);
  if (limits.maxCharacters === -1) return true;
  const count = user._count?.characters ?? 0;
  return count < limits.maxCharacters;
}

export function canEnterCompetition(user: UserForPerms): boolean {
  if (isAdmin(user) || isModerator(user)) return true;
  const limits = getLimits(user.subscriptionTier);
  return limits.competitions;
}

export function isWriter(user: UserForPerms): boolean {
  return user.role === "writer" || user.role === "admin";
}

export function isModerator(user: UserForPerms): boolean {
  return user.role === "moderator" || user.role === "admin";
}

export function isAdmin(user: UserForPerms): boolean {
  return user.role === "admin";
}

export function getAILimit(tier: string): number {
  const limits = getLimits(tier);
  return limits.aiRequestsPerDay;
}
