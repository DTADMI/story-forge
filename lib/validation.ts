import { z } from "zod";

// ── Auth schemas ──

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().max(100).optional(),
});

// ── Project schemas ──

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  defaultScope: z.enum(["PRIVATE", "FRIENDS", "PUBLIC_AUTHENTICATED", "PUBLIC_ANYONE"]).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  content: z.string().max(100000).optional(),
  defaultScope: z.enum(["PRIVATE", "FRIENDS", "PUBLIC_AUTHENTICATED", "PUBLIC_ANYONE"]).optional(),
  wordCount: z.number().min(0).optional(),
});

// ── Character / Location schemas ──

export const createCharacterSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  bio: z.string().max(5000).optional(),
  traits: z.string().max(500).optional(),
  quirks: z.string().max(500).optional(),
  projectId: z.string().optional(),
});

export const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(5000).optional(),
  mapUrl: z.string().url().optional().or(z.literal("")),
  projectId: z.string().optional(),
});

// ── Timeline / Dialogue schemas ──

export const createTimelineEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  date: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  projectId: z.string().optional(),
  characterIds: z.array(z.string()).optional(),
  locationIds: z.array(z.string()).optional(),
});

export const createDialogueSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.array(
    z.object({
      speaker: z.string().optional(),
      line: z.string(),
    })
  ),
  projectId: z.string().optional(),
});

// ── Gamification schemas ──

export const logProgressSchema = z.object({
  value: z.number().min(0, "Value must be positive"),
  goalId: z.string().optional(),
});

export const setGoalSchema = z.object({
  target: z.number().min(1, "Target must be at least 1"),
});

export const cheerSchema = z.object({
  receiverId: z.string().min(1, "Receiver is required"),
});

// ── AI schemas ──

export const aiSuggestSchema = z.object({
  feature: z.enum(["suggest", "character", "plot", "style"]),
  context: z.string().min(1, "Context is required").max(10000),
  multiple: z.boolean().optional(),
  projectId: z.string().optional(),
});

export const aiCharacterSchema = z.object({
  context: z.string().min(1, "Context is required").max(10000),
  projectId: z.string().optional(),
});

export const aiPlotSchema = z.object({
  context: z.string().min(1, "Context is required").max(15000),
  projectId: z.string().optional(),
});

export const aiStyleSchema = z.object({
  context: z.string().min(1, "Context is required").max(10000),
  projectId: z.string().optional(),
  styleGuide: z.string().max(2000).optional(),
});

export const aiResearchSchema = z.object({
  query: z.string().min(1, "Query is required").max(500),
  context: z.string().max(10000).optional(),
  projectId: z.string().optional(),
});

// ── Helper utilities ──

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  return result.success
    ? { success: true as const, data: result.data }
    : { success: false as const, errors: result.error };
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = issue.message;
  }
  return errors;
}

export type { z };
