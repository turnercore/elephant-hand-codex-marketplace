---
name: agent-containers
description: Guides creation and review of Docker images for AI agent runtimes.
---

# Agent Containers

Use this workflow when writing or reviewing a Dockerfile that will run an AI agent, coding agent, or agent worker.

## Workflow

1. **Inspect the runtime contract.** Identify the language/runtime, native dependencies, required CLIs, shell use, browser or sandbox needs, writable paths, network access, exposed ports, and whether the agent installs tools or edits code at runtime.
2. **Choose the base deliberately.** Prefer a maintained `slim` image when prebuilt dependencies expect glibc. Use Alpine only after verifying musl compatibility and measured benefit. Use distroless or `scratch` only when the runtime needs no shell or dynamic tool execution.
3. **Separate build from runtime.** Compile or install in builder stages. Copy only required runtime artifacts into the final image. If the agent genuinely needs Git, a shell, compilers, or package managers at runtime, include them intentionally rather than hiding that requirement.
4. **Optimize cache layers.** Copy dependency manifests and lockfiles first, install dependencies, then copy frequently changing source. Keep expensive stable steps before volatile ones.
5. **Control build context.** Create or review `.dockerignore`; exclude VCS data, local dependencies, logs, caches, build output, editor files, and secrets. Keep `COPY . .` when the context is properly constrained.
6. **Make builds reproducible.** Commit lockfiles, use deterministic install commands, and pin base images by digest. Pair digest pins with an automated, reviewed update process.
7. **Harden the runtime.** Run as non-root; use explicit writable work/cache directories; keep credentials out of layers and build arguments; drop unneeded capabilities; and grant filesystem, network, and host access narrowly.
8. **Preserve operability.** Use exec-form `ENTRYPOINT`/`CMD`, forward signals, stop cleanly, log to stdout/stderr, and define useful health checks. A supervised multi-process image is acceptable only when the processes are tightly coupled and simpler together.
9. **Run droast.** Use the required lint pass below, fix actionable findings, and rerun it before claiming the Dockerfile is ready.
10. **Verify before reporting success.** Build from a clean context, run a smoke task, test shutdown, inspect final size and layers, scan for vulnerabilities and secrets, and compare cold versus warm build behavior.

## Required droast Pass

1. Check for the linter with `command -v droast`.
2. If absent, get approval before a persistent host install. Install with Homebrew (`brew tap immanuwell/droast https://github.com/immanuwell/homebrew-droast.git && brew install immanuwell/droast/droast`) or Cargo (`cargo install dockerfile-roast`). If host installation is undesirable, run a reviewed, pinned `ghcr.io/immanuwell/droast:<version>` image instead.
3. Run `droast --no-roast --min-severity warning Dockerfile`. For multiple files, use the project's Dockerfile glob.
4. Fix warnings and errors, then rerun until clean. Document any intentionally accepted rule and rationale; do not hide findings with `--no-fail` or broad skips.
5. Suggest adding droast to CI with a pinned release when the repository has a Docker build pipeline.

Droast is a focused Dockerfile linter, not proof that the image builds, runs, shuts down correctly, excludes secrets, or meets agent-runtime requirements. Complete the remaining verification steps.

## Agent-Specific Rules

- Do not choose distroless merely for size when the agent must invoke shell commands or discover tools dynamically.
- Do not bake API keys, tokens, SSH material, or user repositories into the image. Mount or inject them at runtime through the platform's secret mechanism.
- Separate immutable agent software from writable workspaces and caches. Make persistence and cleanup behavior explicit.
- Bound CPU, memory, process count, network access, and execution time at the container or orchestrator layer.
- Prefer one stable image with runtime configuration over rebuilding an image for each prompt or task.
- Keep tool installation deterministic. If runtime installation is unavoidable, isolate it in a writable cache and record what was installed.

## Review Output

Report:

- base-image choice and libc/runtime compatibility;
- build-stage and cache strategy;
- final runtime contents and expected writable paths;
- user, permissions, secrets, and network boundaries;
- digest/update policy;
- droast command, findings, fixes, and final result;
- exact build, smoke, shutdown, and scan evidence;
- remaining tradeoffs, especially debugging versus minimalism.

Do not claim an image is production-ready from a successful build alone.

## Source

Adapted from [DevOps Toolbox's Dockerfile guidance](https://www.youtube.com/watch?v=aZ_y2M2OuEA) for agent workloads. Droast usage follows its [official repository](https://github.com/immanuwell/dockerfile-roast).
