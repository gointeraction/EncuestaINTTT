---
file: README.md
doc-type: README
level: L3
area: A3
position: 1
title: TOOLS
summary: Deterministic tools of the EncuestaINTTT project — checkers/builders invoked
  by the OMA engine (`oma_check` / `oma_build`) and by the project's own gates.
---

# .akuri/tools — Deterministic tools

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: this folder holds the project's DETERMINISTIC tools: checkers (`check*.py`) and
builders (`build*.py`) that guarantee the declarations and the code. They are discovered by the
engine (`oma_discover`) and run by `oma_check` / `oma_build`.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=PYTHON.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=SINGLE_TOOL_THREE_FLAVORS.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=COMMAND.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH.

## CHAPTER 3: CONTENT

### SECTION 01-TOOLS

WRITE INFO: project gates live colocated with what they check:

| Gate | Location | Checks |
|------|----------|--------|
| `check-documento-en-es.py` | `.akuri/rules/` | every functional document is authored in Spanish |
| `check-no-console-log.py` | `.akuri/rules/quality/no-console-log/deterministic/` | no stray console.log/debug in `src/` |
| `check-no-write-to-public.py` | `.akuri/rules/analytics/no-write-to-public/deterministic/` | back-office never writes to the `public` schema |
| `check-owner-of-analytics-schema.py` | `.akuri/rules/analytics/owner-of-analytics-schema/deterministic/` | back-office models declare `@@schema("analytics")` |
| `check-rbac-before-data.py` | `.akuri/rules/access/rbac-before-data/deterministic/` | module controllers declare guard/policy/public |
| `check-pii-masking-server-side.py` | `.akuri/rules/access/pii-masking-server-side/deterministic/` | exports apply the server-side PII mask |
| `check-access-audit-required.py` | `.akuri/rules/access/access-audit-required/deterministic/` | protected reads reference the access audit |
| `check-api-sdk-only.py` | `.akuri/rules/angular/api-sdk-only/deterministic/` | console pages use the api-sdk only |
| `check-session-guard.py` | `.akuri/rules/angular/session-guard/deterministic/` | console routes declare a session guard |
| `check-design-system-containers.py` | `.akuri/rules/angular/design-system-containers/deterministic/` | pages/layouts build with `ds-container` |
| `check-constructors.py` | `.akuri/constructors/tools/` | the L4 constructors exist with the right doc-type |
| `check.py` | `.akuri/04-testing/load-and-resilience/deterministic/` | testing set + A2↔A3 coherence |

### SECTION 02-CONVENTION

WRITE INFO: each tool does ONE thing in three flavors (`--action=create|audit|fix`); exit 0 PASS,
1 FAIL, 2 invalid entry condition.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: run `oma_discover(root=a3-...)` to list the deterministic tools; run each with
`--action=audit` on the real corpus.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
