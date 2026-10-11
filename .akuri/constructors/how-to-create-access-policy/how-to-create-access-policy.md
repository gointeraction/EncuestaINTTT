---
file: how-to-create-access-policy.md
doc-type: HOW_TO
level: L4
area: A2
position: 2
title: HOW_TO_CREATE_ACCESS_POLICY
summary: Construye una guarda/política de acceso (RBAC/ABAC) con auditoría de lectura,
  aplicada en el servidor a un controlador del back-office.
---

# HOW_TO_CREATE_ACCESS_POLICY

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: construir UN artefacto: la política de acceso de un controlador (guardas + alcance
por rol) y su registro en la auditoría de acceso.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=GUARD_FIRST.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=POLICY_SERVER_SIDE.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: STEPS

### SECTION 01-FORM-FIELDS

WRITE INFO: entradas: recurso (controlador), roles permitidos (`admin`/`analista`/`auditor`),
columnas/alcance por rol. Salida: guarda/política aplicada.

### SECTION 02-CONSTRUCT

WRITE INFO: pasos: aplicar `@UseGuards(SessionGuard)` + guardas de rol → calcular el alcance por
rol en el servidor → registrar la lectura en `AccessAuditService` (`registrarLectura`).

### SECTION 03-CHECKPOINT

WRITE INFO: checkpoint determinista: cierra cuando el controlador declara guarda/acceso
(`rbac-before-data`) y referencia la auditoría (`access-audit-required`).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el artefacto se cierra cuando sus gates deterministas pasan.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
