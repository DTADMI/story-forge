"use client";

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const globalForSupabase = globalThis as unknown as {
  supabaseClient: SupabaseClient<Database> | undefined;
};

export function createBrowserClient() {
  if (globalForSupabase.supabaseClient) {
    return globalForSupabase.supabaseClient;
  }

  globalForSupabase.supabaseClient = createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return globalForSupabase.supabaseClient;
}
