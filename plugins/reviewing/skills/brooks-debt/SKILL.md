---
name: brooks-debt
description: used for reviews to ensure healthy repo architecture
---

# Brooks-Lint — Tech Debt Assessment

## Setup

1. Read `../../references/brooks/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../../references/brooks/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../../references/brooks/decay-risks.md` for symptom definitions and source attributions
4. Read `debt-guide.md` in this directory for the debt classification framework

## Process

**If the user has not described the codebase or pointed to specific areas:** apply Auto
Scope Detection from `../../references/brooks/common.md` to determine the assessment scope before proceeding.

1. Scan for all six decay risks (Step 1 of the guide); list every finding before scoring
2. Apply the Pain × Spread priority formula and classify debt intent (Steps 2–3 of the guide)
3. Group findings by decay risk (Step 4 of the guide)
4. Output using the Report Template from common.md, plus the Debt Summary Table

**Mode line in report:** `Tech Debt Assessment`
