---
name: subagents
description: Orchestrate economical, context-saving subagent delegation for the rest of a chat.
---

# Subagents

Use subagents to protect the primary agent's context and buy only the intelligence the delegated work needs.

## Activate the policy

Treat explicit invocation as authorization to use subagents economically for the rest of the chat. Continue until the user revokes that authorization. Do not seek approval for each spawn.

Do not force delegation when its coordination overhead exceeds its value. Use the smallest sufficient team and avoid duplicate assignments.

Before the first spawn, read [references/model-selection.md](references/model-selection.md). Use [references/delegation-patterns.md](references/delegation-patterns.md) when drafting assignments.

## Keep ownership with the primary agent

Keep the primary agent responsible for:

- Defining scope, architecture, and bounded contexts.
- Making decisions and resolving proposed goal changes.
- Assigning ownership and preventing overlapping work.
- Integrating delegated commits and resolving conflicts.
- Verifying the combined result.
- Synthesizing reports and communicating with the user.

Let subagents implement, review, suggest, search, execute, and report. Require architecture or scope changes to return as recommendations; do not let a subagent silently enact them.

Use one integration owner per bounded context. Run no more than two simultaneous mutation streams in the same bounded context. Treat shared-workspace overlap as a blocker, not an opportunity for an ad hoc merge.

## Delegate minimal context

Set `fork_turns` to `none` explicitly on every spawn. Never omit it and never use an `all` default.

Give each subagent a compact, task-local handoff:

- A single objective and a clear stopping condition.
- The repository or working directory and the owned scope.
- The input artifacts or commit needed for the task.
- Constraints that cannot be discovered locally.
- The verification command when work may mutate files.
- The required report shape.

Point repository agents to the applicable `AGENTS.md` hierarchy and let them read it. Do not paste the primary agent's conversation, conclusions, unrelated repository context, or full working memory.

Prefer delegation when a task would bloat the primary context merely to find, run, read, inspect, monitor, or summarize something. Keep reactive work with the primary agent when it must respond immediately to changing results.

## Isolate mutations

Assign mutation agents to separate code areas or separate worktrees. Every mutation assignment must declare:

- Owned files or directories.
- Input commit.
- Expected deliverable as a commit.
- Verification command.

Require the agent to commit its changes and return the resulting commit hash. Reject uncommitted edits as a mutation handoff. Let the primary agent review, integrate, and verify every delegated commit.

## Run independent reviews

Delegate review work to an independent, read-only subagent. Give it only the review target, applicable repository instructions, and review objective. Do not pass the primary agent's conclusions, suspected findings, previous reasoning, or an expected answer.

When another review skill is active, direct the reviewer to load it and preserve its workflow. In particular:

- Run Ponytail reviewer delegates at spec lock and each phase boundary when Ponytail is in use.
- Give Brooks reviewer delegates a branch-radius stop condition and ask for split points when Brooks is in use.

Do not require those optional review skills to use this skill.

## Require concise reports

Ask every subagent to return:

1. The conclusion or outcome.
2. Concise evidence, including relevant file paths, line numbers, commands, test names, errors, or warnings.
3. Uncertainties and unresolved risks.
4. For mutations, the owned files, input commit, resulting commit, and verification performed.

Do not request raw logs, full command output, or large pasted excerpts unless they are the required artifact.

## Escalate economically

Start with the cheapest model reasonably expected to succeed. Do not intentionally underpower a task and pay for repeated failure.

Retry the same tier only for transient execution or tooling failures. Escalate when the result shows insufficient reasoning, context handling, or review depth. Pass the next agent the concise evidence needed to continue, not the previous transcript. Stop escalating when the task's value no longer justifies the cost.

## Allow bounded nested delegation

When the platform supports it, allow Terra and Sol agents to spawn Luna High or XHigh children for:

- Scouting repositories or files for something specific.
- Finding specific answers in documentation.
- Running tests and reporting failures, errors, and warnings.
- Watching long-running processes and reporting on logs.
- Other read-only find, run, read, or summarize work that would bloat their context.

Limit nested delegation to one additional level. Require every child spawn to use `fork_turns: none`. Do not allow Luna children to delegate again or mutate files. Keep mutation assignments directly owned by the primary agent. If nested delegation is unavailable, let the primary agent spawn the Luna utility agent instead.
