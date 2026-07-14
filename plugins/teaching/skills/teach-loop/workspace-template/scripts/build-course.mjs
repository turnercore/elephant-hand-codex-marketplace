#!/usr/bin/env node
import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { build } from "vite";

const courseId = "__COURSE_SLUG__";
delete process.env.VITE_LESSON_ID;
await rm("dist", { recursive: true, force: true });
await build();
await mkdir("built-lessons", { recursive: true });
const output = path.join("built-lessons", `${courseId}-course.html`);
await copyFile(path.join("dist", "index.html"), output);
console.log(`Portable course built at ${output}`);
