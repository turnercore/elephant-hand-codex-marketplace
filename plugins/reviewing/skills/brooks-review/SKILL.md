---
name: brooks-review
description: used for reviews to ensure healthy repo architecture
---

# Brooks-Lint — PR Review

## Setup

1. Read `../../references/brooks/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../../references/brooks/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../../references/brooks/decay-risks.md` for symptom definitions and source attributions
4. Read `pr-review-guide.md` in this directory for the analysis process

## Process

**If the user has not specified files or pasted code:** apply Auto Scope Detection
from `../../references/brooks/common.md` to determine the review scope before proceeding.

1. Understand the review scope, then scan for each decay risk in the order specified (Steps 1–6 of the guide)
2. Run the Quick Test Check (Step 7 of the guide) — skip for docs-only or non-production changes
3. Apply the Iron Law to every finding
4. Output using the Report Template from common.md

**Mode line in report:** `PR Review`
