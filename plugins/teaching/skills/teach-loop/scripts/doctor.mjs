#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseTarget(argv) {
  const index = argv.indexOf("--target");
  return path.resolve(index >= 0 ? argv[index + 1] : process.cwd());
}

function parseVersion(value) {
  const [major = 0, minor = 0, patch = 0] = value.split(".").map(Number);
  return { major, minor, patch };
}

function atLeast(actual, required) {
  if (actual.major !== required.major) return actual.major > required.major;
  if (actual.minor !== required.minor) return actual.minor > required.minor;
  return actual.patch >= required.patch;
}

const target = parseTarget(process.argv.slice(2));
const requiredFiles = [
  ".teach-loop.json",
  "MISSION.md",
  "LEARNER.md",
  "LEARNING_MAP.md",
  "RESOURCES.md",
  "TUTOR_NOTES.md",
  "QUESTIONS.md",
  "package.json",
  "components.json",
  "vite.config.ts",
  "src/main.tsx",
  "lessons/0000-orientation.mdx",
  "state/learner-state.json",
];

const failures = [];
const nodeVersion = parseVersion(process.versions.node);
if (!atLeast(nodeVersion, { major: 20, minor: 19, patch: 0 })) {
  failures.push(`Node ${process.versions.node} is too old; use Node 20.19+ or a current Node 22+ release.`);
}

for (const file of requiredFiles) {
  if (!existsSync(path.join(target, file))) failures.push(`Missing ${file}`);
}

if (existsSync(path.join(target, "package.json"))) {
  try {
    const pkg = JSON.parse(await readFile(path.join(target, "package.json"), "utf8"));
    for (const script of ["dev", "build", "build:lesson", "new:lesson", "validate", "test"]) {
      if (!pkg.scripts?.[script]) failures.push(`package.json is missing the ${script} script.`);
    }
  } catch (error) {
    failures.push(`package.json is invalid JSON: ${error.message}`);
  }
}

if (failures.length > 0) {
  console.error("Workspace doctor found problems:");
  failures.forEach((failure) => console.error(`  ✗ ${failure}`));
  process.exitCode = 1;
} else {
  console.log("  ✓ workspace marker");
  console.log("  ✓ learner and tutor state files");
  console.log("  ✓ React lesson runtime");
  console.log("  ✓ lesson source and scripts");
  console.log(`  ✓ Node ${process.versions.node}`);
}
