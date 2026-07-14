#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const siteRoot = resolve(new URL("..", import.meta.url).pathname);
const platformRoot = resolve(process.env.WEBOT_PLATFORM_ROOT || "/Users/webot/Projects/webot-platform");
const skillFiles = [
  "/Users/webot/.agents/skills/webot-flow/SKILL.md",
  "/Users/webot/.codex/skills/webot-flow/SKILL.md"
];

const legacyProvider = ["ver", "cel"].join("");
const legacyShort = ["v", "c"].join("");
const legacyCommandNames = [legacyProvider, legacyShort, `${legacyProvider}m`];
const legacyFullCommand = new RegExp(`(^|[^A-Za-z0-9_-])${legacyProvider}([\\s;&|]|$)`, "i");
const legacyShortCommand = new RegExp(`(^|[^A-Za-z0-9_-])${legacyShort}([\\s;&|]|$)`, "i");
const legacyDerivedCommand = new RegExp(`(^|[^A-Za-z0-9_-])${legacyProvider}m([\\s;&|]|$)`, "i");
const legacyProjectMetadata = new RegExp(
  [
    `\\.${legacyProvider}(/|$)`,
    `${legacyProvider}\\.json`,
    `@${legacyProvider}`,
    `${legacyProvider}\\.app`,
    `${legacyShort}\\.app`,
    ["now", "\\.sh"].join(""),
    ["ZE", "IT"].join("")
  ].join("|"),
  "i"
);
const commandShapedDocReference = new RegExp(
  "`[^`\\n]*(command\\s+-v|npm\\s+run|npx\\s+|pnpm\\s+|yarn\\s+|deploy|env\\s+pull|login)[^`\\n]*" +
    `(${legacyProvider}|${legacyShort}|${legacyProvider}m)` +
    "[^`\\n]*`",
  "i"
);

const shellStartupFiles = [
  join(process.env.HOME ?? "", ".zshrc"),
  join(process.env.HOME ?? "", ".zprofile"),
  join(process.env.HOME ?? "", ".zshenv"),
  join(process.env.HOME ?? "", ".bash_profile"),
  join(process.env.HOME ?? "", ".bashrc")
].filter((file) => file && existsSync(file));

const processFiles = [
  ...collectProcessFiles(siteRoot, ["scripts", ".github/workflows"]),
  ...collectProcessFiles(platformRoot, ["package.json", "scripts", "deploy", ".github/workflows", "tests"])
    .filter((file) => !file.endsWith("owned-runtime-no-legacy-provider.test.ts"))
];
const activeDocFiles = [
  join(siteRoot, "AGENTS.md"),
  join(siteRoot, "ACTIVE_STATE.md"),
  join(siteRoot, ".handoffs/CURRENT_STATE.md"),
  join(siteRoot, ".handoffs/WEBOT_PLATFORM_OWNED_INFRASTRUCTURE_CONTINUATION_2026-06-29.md"),
  join(siteRoot, "llms.txt"),
  join(siteRoot, "project-map.md"),
  join(siteRoot, "docs/PUBLISH-LIVE.md"),
  ...collectProcessFiles(siteRoot, [".planning"]),
  ...collectProcessFiles(platformRoot, ["docs", "project-map.md"]),
  ...collectProcessFiles("/Users/webot/.webot", ["wiki", "handoffs"]),
  ...shellStartupFiles,
  ...skillFiles
].filter((file) => existsSync(file));

const offenders = [];

for (const file of processFiles) {
  const text = readFileSync(file, "utf8");
  if (
    legacyFullCommand.test(text) ||
    legacyShortCommand.test(text) ||
    legacyDerivedCommand.test(text) ||
    legacyProjectMetadata.test(text)
  ) {
    offenders.push(`${relative(siteRoot, file)}: legacy provider process surface`);
  }
}

for (const file of activeDocFiles) {
  const text = readFileSync(file, "utf8");
  if (commandShapedDocReference.test(text) || legacyProjectMetadata.test(text)) {
    offenders.push(`${relative(siteRoot, file)}: command-shaped legacy provider reference`);
  }
}

for (const command of findPathCommands(legacyCommandNames)) {
  offenders.push(`${command}: legacy provider command on PATH`);
}

if (offenders.length > 0) {
  console.error("FAIL owned-runtime process cleanup");
  for (const offender of offenders) {
    console.error(`- ${offender}`);
  }
  process.exit(1);
}

console.log("PASS owned-runtime process cleanup");
console.log(`Scanned ${processFiles.length} process files and ${activeDocFiles.length} active docs/skill files.`);

function collectProcessFiles(root, entries) {
  return entries.flatMap((entry) => {
    const fullPath = join(root, entry);
    if (!existsSync(fullPath)) {
      return [];
    }

    const stats = statSync(fullPath);
    if (stats.isFile()) {
      return [fullPath];
    }

    return walkFiles(fullPath);
  }).filter((file) => /\.(json|mjs|js|ts|sh|yml|yaml|md)$/.test(file))
    .filter((file) => !file.includes("/archive/"))
    .filter((file) => !file.includes(`${join(".handoffs", "archive")}${"/"}`));
}

function walkFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    return stats.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function findPathCommands(names) {
  const hits = [];
  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (!dir) {
      continue;
    }
    for (const name of names) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) {
        hits.push(candidate);
      }
    }
  }
  return hits;
}
