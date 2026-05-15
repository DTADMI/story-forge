import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const hooksPath = path.join(process.cwd(), ".githooks");

if (!fs.existsSync(hooksPath)) {
  console.log("No .githooks directory found — skipping hook installation.");
  process.exit(0);
}

try {
  execSync("git config core.hooksPath .githooks", { stdio: "ignore" });
  console.log("Git hooks path set to .githooks");
} catch (error) {
  console.warn("Failed to set git hooks path:", error instanceof Error ? error.message : error);
}

const preCommitPath = path.join(hooksPath, "pre-commit");
if (fs.existsSync(preCommitPath)) {
  try {
    fs.chmodSync(preCommitPath, 0o755);
    console.log("pre-commit hook marked as executable");
  } catch {
    // Windows doesn't support chmod — that's fine
  }
}

// Verify hooks are configured
try {
  const configured = execSync("git config core.hooksPath", { encoding: "utf-8" }).trim();
  console.log("Verified: core.hooksPath =", configured);
} catch {
  console.warn("Could not verify hooks path configuration.");
}
