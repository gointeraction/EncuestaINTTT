---
file: design-system-containers.md
doc-type: RULE
level: L2
area: A2
position: 1
title: DESIGN_SYSTEM_CONTAINERS
summary: Las páginas y los layouts de la consola se construyen con los containers del
  design system (`ds-container`: display → page → area → section); no con estructura ad-hoc.
category: angular
scope: EncuestaINTTT analytics console — módulos de páginas (modules/**) y layouts (shared/layouts/**).
gate: deterministic/check-design-system-containers.py
actions: create, audit, fix
---

# RULE — design-system-containers (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: cada página (`modules/**/*.component.ts`) y cada layout
(`shared/layouts/**/*.component.ts`) MUST construir su estructura con los containers del
design system (`<ds-container ...>`). — MUST

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: CATEGORY=angular; SCOPE=analytics/console (páginas y layouts).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=DS_CONTAINER_SPINE (display → page → area → section → content).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=DESIGN_SYSTEM.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: las páginas usan `ds-container kind="page"` con `area`s (header/body) y `section`s;
los layouts usan `ds-container kind="display"`. Toda caja estructural es un `ds-container`. — MUST

### SECTION 02-THE-GATE

WRITE INFO: gate `deterministic/check-design-system-containers.py`; `--action=audit` falla si un
componente de página o layout no contiene `<ds-container`.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la regla se cumple cuando el gate retorna exit 0 sobre la consola.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
