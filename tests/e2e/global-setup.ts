// StoryForge E2E auth setup — creates and authenticates a test user for CI.
// Uses Supabase auth API directly to create a session, avoiding UI flakiness.
//
// Usage: added to playwright.config.ts as globalSetup

import { chromium, type FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";

const AUTH_FILE = path.join(process.cwd(), "e2efile:///.auth/user.json");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.TEST_SUPABASE_URL || "http://localhost:54321";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.TEST_SUPABASE_ANON_KEY || "test-anon-key";
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "e2e-test@storyforge.local";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "E2eTestPass123!";

async function globalSetup(_config: FullConfig) {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Sign in (or sign up if user doesn't exist)
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signInError) {
    // User doesn't exist — create one
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: { data: { display_name: "E2E Test User" } },
    });

    if (signUpError) {
      console.warn(`[auth-setup] Could not create test user: ${signUpError.message}`);
      // Write empty auth file — tests will skip
      fs.writeFileSync(AUTH_FILE, JSON.stringify({}));
      return;
    }

    // Sign in again to get session
    const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (retryError) {
      console.warn(`[auth-setup] Sign-in after signup failed: ${retryError.message}`);
      fs.writeFileSync(AUTH_FILE, JSON.stringify({}));
      return;
    }

    writeAuthState(retryData);
  } else {
    writeAuthState(signInData);
  }
}

function writeAuthState(data: { session: { access_token: string; refresh_token: string; expires_at?: number } | null }) {
  if (!data.session) {
    fs.writeFileSync(AUTH_FILE, JSON.stringify({}));
    return;
  }

  // Write Playwright-compatible storage state
  // This sets cookies + localStorage that Playwright will replay
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: "http://localhost:3000",
        localStorage: [
          {
            name: "sb-access-token",
            value: data.session.access_token,
          },
          {
            name: "sb-refresh-token",
            value: data.session.refresh_token,
          },
        ],
      },
    ],
  };

  // Also store tokens for the supabase-js client
  const authState = {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    email: TEST_EMAIL,
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(authState, null, 2));

  // Also write Playwright storage state for easy reuse
  const storageStatePath = path.join(process.cwd(), "e2efile:///.auth/storage-state.json");
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  fs.writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2));

  console.log("[auth-setup] Test user authenticated successfully");
}

export default globalSetup;