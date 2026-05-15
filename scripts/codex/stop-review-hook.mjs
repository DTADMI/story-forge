// Stop review hook — validates changes before session ends.
// This runs automatically when the agent session stops (via .codex/hooks.json).

const { execSync } = await import("node:child_process");
const fs = await import("node:fs");
const path = await import("node:path");

const checks = [];

// Check 1: Git status — are there uncommitted changes?
try {
  const status = execSync("git status --porcelain", { encoding: "utf-8" }).trim();
  if (status) {
    const lines = status.split("\n").length;
    checks.push({ name: "git status", status: "warn", detail: `${lines} uncommitted file(s)` });
  } else {
    checks.push({ name: "git status", status: "ok", detail: "clean" });
  }
} catch {
  checks.push({ name: "git status", status: "ok", detail: "not a git repo" });
}

// Check 2: Documentation consistency — does action-plan.md mention recent changes?
try {
  const actionPlan = path.join(process.cwd(), "action-plan.md");
  if (fs.existsSync(actionPlan)) {
    const stat = fs.statSync(actionPlan);
    const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageDays > 7) {
      checks.push({ name: "action-plan.md", status: "warn", detail: `last updated ${ageDays.toFixed(0)} days ago` });
    } else {
      checks.push({ name: "action-plan.md", status: "ok", detail: `updated ${ageDays.toFixed(0)} days ago` });
    }
  }
} catch {
  // Ignore
}

console.log(JSON.stringify({ hook: "stop-review", checks, timestamp: new Date().toISOString() }, null, 2));
