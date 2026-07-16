# Delegation patterns

Use these as compact assignment shapes, not as context dumps. Always set the spawn parameters explicitly:

```yaml
model: <5.6-luna|5.6-terra|5.6-sol>
reasoning: <lite|medium|high|xhigh>
fork_turns: none
```

## Repository or documentation scout

```text
Objective: Find <specific fact or location>.
Scope: <repository/path/docs URL>.
Instructions: Read applicable repository instructions. Search only the scope needed to answer the objective. Do not mutate files.
Return: Conclusion; concise evidence with paths, lines, or URLs; uncertainties. Do not paste whole files or pages.
Stop when: The answer is supported or the scoped sources are exhausted.
```

## Test or command runner

```text
Objective: Run <exact command> from <working directory>.
Scope: Execution and diagnosis only. Do not mutate files unless the command itself creates known disposable output.
Return: Pass/fail; failing test names; concise errors and warnings; relevant artifact paths. Do not return the full log.
Stop when: The command finishes or a defined timeout/blocker is reached.
```

## Long-running monitor

```text
Objective: Start or observe <process> until <completion condition>.
Scope: <working directory/process/log paths>. Do not mutate source files.
Return: Final state; important transitions; concise errors and warnings; log locations.
Stop when: <success, failure, timeout, or other terminal condition>.
```

## Independent review

```text
Objective: Review <commit/PR/diff/files/feature> for <review objective>.
Scope: Read-only. Read applicable repository instructions. Form an independent view; do not assume the expected result is clean.
Context: Provide the review target and necessary specification only. Do not provide the parent's conclusions, suspected findings, or prior review transcript.
Return: Findings ordered by severity with file and line evidence; uncertainties; concise clean verdict if there are no findings.
Stop when: The target and directly relevant context have been reviewed.
```

## Isolated mutation

```text
Objective: Implement <bounded change>.
Working area: <worktree or working directory>.
Owned files: <exclusive files/directories>.
Input commit: <sha>.
Constraints: Read applicable repository instructions. Do not broaden scope or modify files outside ownership; return proposed architecture changes instead of enacting them.
Verification: <exact command>.
Deliverable: Commit the completed change.
Return: Summary; owned files changed; input and resulting commit hashes; verification result; uncertainties and unresolved risks.
Stop when: The bounded change is committed and verified, or a blocker requires the primary agent.
```

## Follow-up verification

```text
Objective: Independently verify that <prior findings/change> is resolved.
Scope: <target>. Read-only.
Context: Provide the target and acceptance criteria, not the prior agent's reasoning transcript.
Return: Clean/not clean; remaining findings with concise evidence; uncertainties.
Stop when: Each acceptance criterion has been checked.
```
