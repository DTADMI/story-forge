// Session start hook — validates coding environment before work begins.
// This runs automatically when the agent session starts (via .codex/hooks.json).

const checks = [];

// Check 1: pnpm is available
try {
  const { execSync } = await import("node:child_process");
  const version = execSync("pnpm --version", { encoding: "utf-8" }).trim();
  checks.push({ name: "pnpm", status: "ok", detail: version });
} catch {
  checks.push({ name: "pnpm", status: "missing", detail: "pnpm not found in PATH" });
}

// Check 2: Node version
try {
  const { execSync } = await import("node:child_process");
  const version = execSync("node --version", { encoding: "utf-8" }).trim();
  const major = parseInt(version.replace("v", "").split(".")[0]);
  if (major >= 24) {
    checks.push({ name: "node", status: "ok", detail: version });
  } else {
    checks.push({ name: "node", status: "warn", detail: `${version} (expected >=24)` });
  }
} catch {
  checks.push({ name: "node", status: "missing", detail: "node not found" });
}

// Check 3: Git repo
const fs = await import("node:fs");
const path = await import("node:path");
const gitDir = path.join(process.cwd(), ".git");
if (fs.existsSync(gitDir)) {
  checks.push({ name: "git repo", status: "ok", detail: process.cwd() });
} else {
  checks.push({ name: "git repo", status: "warn", detail: "not a git repository" });
}

// Check 4: Prisma schema exists
const prismaSchema = path.join(process.cwd(), "prisma", "schema.prisma");
if (fs.existsSync(prismaSchema)) {
  checks.push({ name: "prisma schema", status: "ok", detail: "found" });
} else {
  checks.push({ name: "prisma schema", status: "warn", detail: "not found" });
}

// Check 5: node_modules exist
const nm = path.join(process.cwd(), "node_modules");
if (fs.existsSync(nm)) {
  checks.push({ name: "dependencies", status: "ok", detail: "installed" });
} else {
  checks.push({ name: "dependencies", status: "warn", detail: "run pnpm install" });
}

console.log(JSON.stringify({ hook: "session-start", checks, timestamp: new Date().toISOString() }, null, 2));
