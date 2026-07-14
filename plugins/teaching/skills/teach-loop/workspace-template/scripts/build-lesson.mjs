#!/usr/bin/env node
import { access, copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { build } from "vite";

const lessonId = process.argv[2]?.trim();
if (!lessonId || !/^\d{4}-[a-z0-9-]+$/.test(lessonId)) {
  console.error("Usage: npm run build:lesson -- 0001-lesson-id");
  process.exit(1);
}

await access(path.join("lessons", `${lessonId}.mdx`));
process.env.VITE_LESSON_ID = lessonId;
await rm("dist", { recursive: true, force: true });
await build();
await mkdir("built-lessons", { recursive: true });
const output = path.join("built-lessons", `${lessonId}.html`);
await copyFile(path.join("dist", "index.html"), output);
console.log(`Portable lesson built at ${output}`);
