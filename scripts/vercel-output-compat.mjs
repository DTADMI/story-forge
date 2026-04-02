import { cpSync, existsSync, symlinkSync } from "node:fs";
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

const rootNodeModules = resolve(cwd, "node_modules");
const webNodeModules = resolve(cwd, "web", "node_modules");

if (!existsSync(rootNodeModules) && existsSync(webNodeModules)) {
  try {
    symlinkSync("web/node_modules", rootNodeModules, "dir");
    console.log(`[vercel-output-compat] Linked node_modules: ${rootNodeModules} -> ${webNodeModules}`);
  } catch {
    console.warn("[vercel-output-compat] Could not link root node_modules to web/node_modules.");
  }
}
