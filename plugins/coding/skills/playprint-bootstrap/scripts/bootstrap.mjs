#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

const DEFAULT_SOURCE = "https://forge.elephanthand.com/Elephant-Hand-Games/playprint.git";
const DEFAULT_REF = "v0.2.0-alpha.3";

function usage() {
  return "Usage: bootstrap.mjs --root <host-repo> [--godot godot] [--ref <tag-or-commit>] [--source <git-url>]";
}

function parse(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === "--help" || key === "-h") return { help: true };
    if (key === undefined || !key.startsWith("--")) throw new Error(`Unexpected value: ${key}`);
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) throw new Error(`${key} requires a value.`);
    values.set(key, value);
    index += 1;
  }
  for (const key of values.keys())
    if (!["--root", "--godot", "--ref", "--source"].includes(key))
      throw new Error(`Unknown option: ${key}`);
  const root = values.get("--root");
  if (root === undefined) throw new Error("--root is required.");
  return {
    help: false,
    root: resolve(root),
    godot: values.get("--godot") ?? "godot",
    ref: values.get("--ref") ?? DEFAULT_REF,
    source: values.get("--source") ?? DEFAULT_SOURCE,
  };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function output(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

async function run(command, args, cwd) {
  await new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code ?? "no status"}.`));
    });
  });
}

function ensureInside(root, candidate, label) {
  const path = relative(root, candidate);
  if (isAbsolute(path) || path === ".." || path.startsWith(`..${sep}`))
    throw new Error(`${label} must be inside the Host Game Repository.`);
}

async function ensureGodotProject(root, configured) {
  const godot = resolve(root, configured);
  ensureInside(root, godot, "Godot project");
  const project = resolve(godot, "project.godot");
  if (await exists(project)) return godot;
  if (await exists(godot)) {
    const entries = await readdir(godot);
    if (entries.length > 0)
      throw new Error(
        `Refusing to initialize a non-empty directory without project.godot: ${godot}`,
      );
  }
  await mkdir(godot, { recursive: true });
  await writeFile(
    project,
    '; Engine configuration file.\nconfig_version=5\n\n[application]\nconfig/name="Playprint Host Game"\n\n[display]\nwindow/size/viewport_width=1280\nwindow/size/viewport_height=720\n\n[rendering]\nrenderer/rendering_method="gl_compatibility"\nrenderer/rendering_method.mobile="gl_compatibility"\n',
  );
  return godot;
}

async function installSnapshot(root, source, ref) {
  if (["main", "master", "develop", "HEAD"].includes(ref))
    throw new Error("--ref must be an immutable tag or commit, not a moving branch.");
  const target = resolve(root, ".playprint/toolchain");
  if (await exists(target)) {
    if (!(await exists(resolve(target, ".git"))))
      throw new Error(`Existing Toolchain Snapshot is not a Git checkout: ${target}`);
    if (output("git", ["status", "--porcelain"], target) !== "")
      throw new Error("Existing Toolchain Snapshot is dirty; refusing to discard changes.");
    const existingSource = output("git", ["remote", "get-url", "origin"], target);
    if (existingSource !== source)
      throw new Error(`Existing Toolchain Snapshot source is ${existingSource}, not ${source}.`);
    await run("git", ["fetch", "--force", "--tags", "origin"], target);
  } else {
    await mkdir(resolve(root, ".playprint"), { recursive: true });
    await run("git", ["clone", source, target], root);
  }
  if (spawnSync("git", ["rev-parse", "--verify", `${ref}^{commit}`], { cwd: target }).status !== 0)
    await run("git", ["fetch", "--force", "origin", ref], target);
  await run("git", ["checkout", "--detach", ref], target);
  return target;
}

async function main() {
  const options = parse(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  if (Number(process.versions.node.split(".")[0]) < 20)
    throw new Error("Node 20 or newer is required.");
  output("git", ["rev-parse", "--show-toplevel"], options.root);
  const godot = await ensureGodotProject(options.root, options.godot);
  const toolchain = await installSnapshot(options.root, options.source, options.ref);
  await run("npm", ["ci"], toolchain);
  await run("npm", ["run", "build:packages"], toolchain);
  console.log(
    await readFile(
      resolve(toolchain, "packages/compiler/templates/initialization/INIT.md"),
      "utf8",
    ),
  );
  await run(
    process.execPath,
    [
      resolve(toolchain, "packages/compiler/dist/cli.js"),
      "init",
      "--root",
      options.root,
      "--godot",
      godot,
      "--toolchain-ref",
      options.ref,
      "--toolchain-source",
      options.source,
    ],
    options.root,
  );
  await run("npm", ["install", "--prefix", resolve(options.root, "playprint")], options.root);
  await run(
    process.execPath,
    [resolve(options.root, "playprint/playprint.mjs"), "doctor"],
    options.root,
  );
  console.log(`PLAYPRINT_BOOTSTRAP_OK ${options.ref}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
