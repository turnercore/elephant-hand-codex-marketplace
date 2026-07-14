#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.dirname(scriptDir);
const templateDir = path.join(skillRoot, "workspace-template");
const skillVersion = (await readFile(path.join(skillRoot, "VERSION"), "utf8")).trim();

function printHelp() {
  console.log(`Teach Loop course initializer

Usage:
  node scripts/init-course.mjs [course title] [options]

Options:
  --target <path>                  Target directory (default: current directory)
  --package-manager <npm|pnpm|bun> Package manager (default: npm)
  --no-install                     Skip dependency installation
  --no-git                         Skip git initialization
  --help                           Show this help

Safety:
  The target must be empty. There is intentionally no overwrite flag.`);
}

function parseArgs(argv) {
  const options = {
    titleParts: [],
    target: process.cwd(),
    packageManager: "npm",
    install: true,
    git: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--help" || value === "-h") {
      options.help = true;
    } else if (value === "--target") {
      options.target = argv[++index] ?? "";
    } else if (value === "--package-manager") {
      options.packageManager = argv[++index] ?? "";
    } else if (value === "--no-install") {
      options.install = false;
    } else if (value === "--no-git") {
      options.git = false;
    } else if (value.startsWith("--")) {
      throw new Error(`Unknown option: ${value}`);
    } else {
      options.titleParts.push(value);
    }
  }

  return options;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "learning-course";
}

function commandExists(command) {
  return spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0;
}

async function assertEmptyDirectory(target) {
  await mkdir(target, { recursive: true });
  const entries = await readdir(target);
  const harmless = new Set([".DS_Store", "Thumbs.db"]);
  const meaningful = entries.filter((entry) => !harmless.has(entry));

  if (meaningful.length > 0) {
    throw new Error(
      `Teach Loop will not overwrite a non-empty directory. Found: ${meaningful
        .slice(0, 8)
        .join(", ")}${meaningful.length > 8 ? ", …" : ""}`,
    );
  }

  for (const entry of entries.filter((item) => harmless.has(item))) {
    await rm(path.join(target, entry), { force: true });
  }
}

const textExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonl",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

async function replacePlaceholders(directory, replacements) {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await replacePlaceholders(fullPath, replacements);
        return;
      }

      const extension = path.extname(entry.name);
      const isKnownDotfile = [".editorconfig", ".gitignore", ".npmrc"].includes(entry.name);
      if (!textExtensions.has(extension) && !isKnownDotfile) return;

      let content = await readFile(fullPath, "utf8");
      for (const [needle, replacement] of Object.entries(replacements)) {
        content = content.split(needle).join(replacement);
      }
      await writeFile(fullPath, content);
    }),
  );
}

function run(command, args, cwd, label) {
  console.log(`\n${label}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, npm_config_fund: "false", npm_config_audit: "false" },
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  if (!options.target) throw new Error("--target requires a path.");
  if (!new Set(["npm", "pnpm", "bun"]).has(options.packageManager)) {
    throw new Error("--package-manager must be npm, pnpm, or bun.");
  }

  const target = path.resolve(options.target);
  const defaultTitle = path.basename(target).replace(/[-_]+/g, " ") || "Learning Course";
  const title = options.titleParts.join(" ").trim() || defaultTitle;
  const slug = slugify(title);
  const createdDate = new Date().toISOString().slice(0, 10);

  await access(templateDir, fsConstants.R_OK);
  await assertEmptyDirectory(target);

  console.log(`Creating Teach Loop workspace: ${title}`);
  console.log(`Target: ${target}`);

  for (const entry of await readdir(templateDir)) {
    await cp(path.join(templateDir, entry), path.join(target, entry), {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }

  await replacePlaceholders(target, {
    __COURSE_TITLE__: title,
    __COURSE_SLUG__: slug,
    __CREATED_DATE__: createdDate,
    __TEACH_LOOP_VERSION__: skillVersion,
  });

  if (options.install) {
    if (!commandExists(options.packageManager)) {
      throw new Error(
        `${options.packageManager} is not available. Re-run with --package-manager npm or --no-install.`,
      );
    }
    const installArgs = options.packageManager === "npm" ? ["install", "--legacy-peer-deps"] : ["install"];
    run(options.packageManager, installArgs, target, `Installing dependencies with ${options.packageManager}…`);
  }

  if (options.git) {
    if (commandExists("git")) {
      console.log("\nInitializing git repository…");
      const mainResult = spawnSync("git", ["init", "-b", "main"], {
        cwd: target,
        stdio: "inherit",
      });
      if (mainResult.status !== 0) {
        run("git", ["init"], target, "Falling back to the git default branch…");
      }
    } else {
      console.warn("\nGit is not installed; continuing without repository initialization.");
    }
  }

  run(process.execPath, [path.join(skillRoot, "scripts", "doctor.mjs"), "--target", target], target, "Checking workspace…");

  console.log(`\nTeach Loop is ready.\n
Next:
  1. Read SKILL.md from the installed skill and the workspace Markdown files.
  2. Interview the learner and update MISSION.md, LEARNER.md, and LEARNING_MAP.md.
  3. Research and annotate sources in RESOURCES.md and src/course/sources.ts.
  4. Run: ${options.packageManager} run dev
  5. Create a lesson: ${options.packageManager} run new:lesson -- "Focused lesson title"`);
}

main().catch((error) => {
  console.error(`\nTeach Loop initialization failed:\n${error.message}`);
  process.exitCode = 1;
});
