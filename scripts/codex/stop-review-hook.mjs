import { spawnSync } from "node:child_process";

function gitChangedPaths() {
  const result = spawnSync("git", ["status", "--short"], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(3).trim());
}

const changedPaths = gitChangedPaths();

if (changedPaths.length === 0) {
  process.exit(0);
}

const reminders = [];
const touchesUi = changedPaths.some((path) => /^(web|api)\//.test(path));
const touchesDocs = changedPaths.some((path) => /^docs\//.test(path));
const touchesDb = changedPaths.some((path) => /^prisma\//.test(path));
const touchesAgentTooling = changedPaths.some(
  (path) => /^(AGENTS\.md|\.agents\/|\.codex\/|plugins\/storyforge-integrations\/|scripts\/codex\/)/.test(path)
);

if (touchesUi) {
  reminders.push("UI/API changes detected: confirm responsive behavior, hover states, and 320px validation.");
}

if (touchesDocs) {
  reminders.push("Docs changes detected: keep docs indexes and references aligned with source-of-truth changes.");
}

if (touchesDb) {
  reminders.push(
    "Prisma schema changes detected: confirm migration files, schema consistency, and API alignment."
  );
}

if (touchesAgentTooling) {
  reminders.push("Agent tooling changed: confirm rules/hooks/skills/plugins layer integrity.");
}

if (reminders.length === 0) {
  process.exit(0);
}

console.log("Story Forge stop review reminders:");
for (const reminder of reminders) {
  console.log(`- ${reminder}`);
}
