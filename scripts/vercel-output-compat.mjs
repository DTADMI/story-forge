import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const cwd = process.cwd();
const sourceCandidates = [resolve(cwd, ".next"), resolve(cwd, "web", ".next")];
const targetCandidates = [resolve(cwd, ".next"), resolve(cwd, "web", ".next")];

const source = sourceCandidates.find((dir) => existsSync(dir));
if (!source) {
  console.warn("[vercel-output-compat] No .next directory found; skipping.");
  process.exit(0);
}

for (const target of targetCandidates) {
  if (target === source) continue;
  cpSync(source, target, { recursive: true, force: true });
  console.log(`[vercel-output-compat] Mirrored output: ${source} -> ${target}`);
}
