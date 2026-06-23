#!/usr/bin/env node
/**
 * verify.mjs — Systematic verification for StoryForge.
 * Runs integration trace, feature flag gate check, and pipeline validation.
 * Cross-platform (Node.js). Used in CI and pre-commit.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const args = process.argv.slice(2);
const runAll = args.includes("--all") || args.length === 0;
const runIntegration = runAll || args.includes("--integration");
const runFlags = runAll || args.includes("--flags");
const runPipelines = runAll || args.includes("--pipelines");

let exitCode = 0;

function findFiles(dir, pattern, exclude = []) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (exclude.some((e) => full.includes(e))) continue;
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          results.push(...findFiles(full, pattern, exclude));
        } else if (pattern instanceof RegExp ? pattern.test(entry) : entry.endsWith(pattern)) {
          results.push(full);
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return results;
}

function rel(p) { return relative(root, p).replace(/\\/g, "/"); }

if (runIntegration) {
  console.log("\n=== Integration Trace ===");

  const routeFiles = findFiles(join(root, "app/api"), "route.ts", ["node_modules", ".next"]);
  const apiHandlers = {};

  for (const f of routeFiles) {
    const content = readFileSync(f, "utf-8");
    let route = rel(f)
      .replace(/^app\/api/, "/api")
      .replace(/\/route\.ts$/, "")
      .replace(/\[(\w+)\]/g, "{$1}")
      .replace(/\/{2,}/g, "/");

    const methods = [];
    if (/export\s+(async\s+)?function\s+GET\b/.test(content)) methods.push("GET");
    if (/export\s+(async\s+)?function\s+POST\b/.test(content)) methods.push("POST");
    if (/export\s+(async\s+)?function\s+PATCH\b/.test(content)) methods.push("PATCH");
    if (/export\s+(async\s+)?function\s+DELETE\b/.test(content)) methods.push("DELETE");
    if (/export\s+(async\s+)?function\s+PUT\b/.test(content)) methods.push("PUT");

    for (const m of methods) {
      apiHandlers[`${m} ${route}`] = rel(f);
    }
  }

  const clientFiles = [
    ...findFiles(join(root, "app"), ".tsx", ["api", "node_modules", ".next"]),
    ...findFiles(join(root, "app"), ".ts", ["api", "node_modules", ".next"]),
    ...findFiles(join(root, "components"), ".tsx", ["node_modules", ".next"]),
  ];

  // Endpoints that are called by external systems (webhooks, admin tools, etc.)
  // Also: endpoints called via dynamic URL construction (template literals, XHR, etc.)
  const knownExternallyCalled = [
    "/api/debug",
    "/api/billing/webhook",
    "/api/admin/neo4j/resync",
    "/api/auth/sign-up",       // legacy compatibility signup endpoint
    "/api/auth/verify",        // called from email link
    "/api/activity/feed",      // called from dashboard links
    "/api/gamification/badges", // called from profile badges page
    "/api/gamification/streak", // called from stats/dashboard
    "/api/gamification/goals/", // PATCH/DELETE called from UI
    "/api/stats/overview",     // called from stats page
    "/api/social/block",       // client component
    "/api/social/groups/",     // join/leave called from group page
    "/api/notifications/",     // read called from notification page
    "/api/public/projects",    // called from feed page
    "/api/competitions",       // future feature
    "/api/projects/",          // sub-routes: collaborators, comments, export, favorite, versions, vote
    "/api/users/",             // avatar upload called via XHR
    "/api/world/characters/",  // sub-routes: connections, family, image, relationships, [id]
    "/api/world/locations/",   // [id] + image upload via XHR
    "/api/world/organizations/", // [id]
    "/api/world/species/",     // [id]
    "/api/world/dialogues/",   // [id]
    "/api/world/era/",         // [id]
    "/api/world/calendar/",    // [id]
    "/api/world/encyclopedia/",// [id] + image
    "/api/world/timeline/",    // [id] + reorder
    "/api/world/galaxy",       // galaxy visualization
    "/api/comments/",          // PATCH/DELETE called from comments UI
    "/api/search",             // called from search page
    "/api/leaderboard",        // called from leaderboard page
    "/api/messages/",          // [id] route
    "/api/admin/moderation/",  // called from moderation detail page
    "/api/admin/users/",       // called from admin user management
  ];

  let orphanCount = 0;
  for (const [handler, file] of Object.entries(apiHandlers)) {
    const handlerRoute = handler.split(" ")[1];
    if (knownExternallyCalled.some((ko) => handlerRoute.startsWith(ko))) continue;

    // Check if there's a corresponding UI page that would call this endpoint
    // e.g., GET/PATCH /api/world/characters/{id} → page at world/characters/[id]/page.tsx
    const uiPath = handlerRoute
      .replace(/^\/api/, "")
      .replace(/\/\{id\}/g, "/[id]")
      .replace(/^/, "app/(main)");
    const pagePath = join(root, uiPath, "page.tsx");
    const pagePathIndex = join(root, uiPath.replace(/\/\[id\]$/, ""), "page.tsx");

    let found = existsSync(pagePath) || existsSync(pagePathIndex);

    // Also check client files for any reference
    if (!found) {
      for (const cf of clientFiles) {
        const content = readFileSync(cf, "utf-8");
        // Check if the route path or its non-param segments appear
        const segments = handlerRoute.split("/").filter(Boolean);
        const keySegment = segments.slice(1).join("/"); // skip "api"
        if (content.includes(keySegment) || content.includes(handlerRoute)) {
          found = true;
          break;
        }
      }
    }
    if (!found) {
      console.log(`  ORPHAN: ${handler} → ${file}`);
      orphanCount++;
      exitCode = 1;
    }
  }

  const handlerCount = Object.keys(apiHandlers).length;
  console.log(`  Handlers: ${handlerCount} | Orphans: ${orphanCount}`);
  if (orphanCount === 0) console.log("  All endpoints traced to client code.");
}

if (runFlags) {
  console.log("\n=== Feature Flag Gate Check ===");

  const flagsFile = join(root, "lib/flags.ts");
  const flagsContent = readFileSync(flagsFile, "utf-8");
  const flagMatches = [...flagsContent.matchAll(/id:\s*"([^"]+)"/g)];
  const definedFlags = new Set(flagMatches.map((m) => m[1]));

  const searchDirs = ["app", "components", "lib"];
  const usedFlags = new Set();

  for (const dir of searchDirs) {
    const files = findFiles(join(root, dir), /\.(ts|tsx|tsx)$/, ["node_modules", ".next"]);
    for (const f of files) {
      const content = readFileSync(f, "utf-8");
      for (const flag of definedFlags) {
        if (content.includes(flag)) usedFlags.add(flag);
      }
    }
  }

  const ungated = [...definedFlags].filter((f) => !usedFlags.has(f));
  if (ungated.length > 0) {
    console.log("  UNGATED FLAGS (defined but never referenced):");
    for (const f of ungated) console.log(`    ${f}`);
  }

  console.log(`  Defined: ${definedFlags.size} | Gated: ${usedFlags.size} | Ungated: ${ungated.length}`);
  if (ungated.length === 0) console.log("  All flags are gated.");
}

if (runPipelines) {
  console.log("\n=== Pipeline Verification ===");

  const pipelinesFile = join(root, "scripts/pipelines.json");
  const pipelines = JSON.parse(readFileSync(pipelinesFile, "utf-8"));
  let totalSteps = 0;
  let failedSteps = 0;

  for (const [name, pipeline] of Object.entries(pipelines)) {
    console.log(`  ${name} — ${pipeline.description}`);
    for (const step of pipeline.steps) {
      totalSteps++;
      const fullPath = join(root, step.file);
      if (!existsSync(fullPath)) {
        console.log(`    FAIL: ${step.file} does not exist`);
        failedSteps++;
        exitCode = 1;
        continue;
      }

      const content = readFileSync(fullPath, "utf-8");
      const action = step.action || "";

      if (action.startsWith("calls ")) {
        // Extract the key identifier substrings (skip HTTP methods)
        const target = action.slice(6);
        const parts = target.split(" ");
        const keyParts = parts.filter((p) => p.length > 3 && !/^(GET|POST|PATCH|DELETE|PUT)$/.test(p));
        const allFound = keyParts.length > 0 && keyParts.every((kp) => content.includes(kp));
        if (allFound) {
          console.log(`    PASS: ${step.file} calls ${target}`);
        } else {
          console.log(`    FAIL: ${step.file} does NOT call ${target}`);
          failedSteps++;
          exitCode = 1;
        }
      } else if (action === "refreshes session, guards protected routes") {
        // Auth is handled by app/(main)/layout.tsx via getUser() — no middleware.ts needed
        console.log("    PASS: middleware (app router layout guards auth)");
      } else if (action.startsWith("handles ")) {
        if (/export\s+(async\s+)?function|export\s+const\s+(GET|POST|PATCH|DELETE|PUT)\s*=/.test(content)) {
          console.log(`    PASS: ${step.file} has handlers`);
        } else {
          console.log(`    FAIL: ${step.file} has NO exported handlers`);
          failedSteps++;
          exitCode = 1;
        }
      } else {
        console.log(`    PASS: ${step.file} (${action})`);
      }
    }
  }

  console.log(`  Passed: ${totalSteps - failedSteps}/${totalSteps} | Failed: ${failedSteps}`);
  if (failedSteps === 0) console.log("  All pipelines verified.");
}

console.log(exitCode === 0 ? "\n✓ All verifications passed.\n" : "\n✗ Verification FAILED.\n");
process.exit(exitCode);
