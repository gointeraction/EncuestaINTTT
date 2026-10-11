---
file: README.md
doc-type: README
level: L3
area: A3
position: 1
title: ENCUESTAINTTT_DOCS
summary: Corpus funcional de EncuestaINTTT, colocado en .akuri/docs/. Define cada
  feature como un transversal vertical (persistencia, backend, frontend-lógica,
  frontend-visual, experiencias y matrices) que sirve de contrato de construcción
  (doc_plan) y de referencia de auditoría (doc_audit).
---

# .akuri/docs — El corpus funcional de EncuestaINTTT

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: esta carpeta es el corpus **funcional**: la definición vertical de cada feature en
todas sus capas. Es el contrato que el pack `akuri-oma-documentation` usa para descubrir
(`doc_discover`), verificar (`doc_check`), planear (`doc_plan`) y auditar (`doc_audit`).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=MARKDOWN (cuerpo) · TECH=YAML (frontmatter y reglas locales) · TECH=ADL
(sketches visuales) · TECH=PSEUDO (reglas de flujo).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=EPIC_TRANSVERSAL; ARCH_PATTERN=INTEGRAL_DOCUMENT;
  ARCH_PATTERN=LOCAL_RULES_DRIVE.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=DOC_AS_CONTRACT; DESIGN_PATTERN=PLAN_FIRST.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=NUMBERED_SECTIONS.

## CHAPTER 3: THE CORPUS

### SECTION 01-ESTRUCTURA

WRITE INFO: estructura del corpus:

| Ruta | Contenido |
|---|---|
| `README.md` | este índice |
| `epics/<slug>/README.md` | índice de la épica (doc-type EPIC) |
| `epics/<slug>/transversal-<feature>.md` | un feature completo por capa (doc-type TRANSVERSAL) |
| `epics/<slug>/sketches/<feature>.adl` | sketch ADL de la capa visual |
| `epics/<slug>/rules/<feature>.pseudo` | reglas de flujo en pseudocódigo |

### SECTION 02-REGLAS-LOCALES

WRITE INFO: las reglas locales del corpus viven en `.akuri/rules/rules.yaml` (composición sobre
las normas base N01…N10 del pack) y el chequeo local `check-documento-en-es.py` exige que todos
los documentos estén en español.

### SECTION 03-ESTADO

WRITE INFO: las épicas declaradas en el manifiesto (`00-manifest/00-project-manifest.md` §4) se
documentan aquí. El corpus se construye con `doc_build` y se verifica con `doc_check`.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: un transversal se cierra cuando su gate pasa:
  `doc_check kind=transversal path=<feature>` (N01…N10 + reglas locales).

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
