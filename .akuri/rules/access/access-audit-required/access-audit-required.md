---
file: access-audit-required.md
doc-type: RULE
level: L2
area: A2
position: 1
title: ACCESS_AUDIT_REQUIRED
summary: Toda lectura de información sensible por personal autorizado queda auditada
  (quién, qué, cuándo). La auditoría de acceso es obligatoria en el back-office.
category: access
scope: EncuestaINTTT analytics backend (analytics/api/src/modules) — lecturas protegidas.
gate: deterministic/check-access-audit-required.py
actions: create, audit, fix
---

# RULE — access-audit-required (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: todo controlador con lectura protegida (`@Get(` sin `@Public(`) MUST registrar la
lectura en la auditoría de acceso (`AccessAudit`/`audit`). — MUST

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: CATEGORY=access; SCOPE=analytics/api/src/modules (**/*.controller.ts).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=READ_AUDIT.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: cada `*.controller.ts` con `@Get(` y sin `@Public(` MUST referenciar la auditoría de
acceso (`accessAudit`/`AccessAudit`/`audit`). — MUST

### SECTION 02-THE-GATE

WRITE INFO: gate `deterministic/check-access-audit-required.py`; `--action=audit` falla si una
lectura protegida no referencia la auditoría.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la regla se cumple cuando el gate retorna exit 0 (o no existen controladores aún).

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
