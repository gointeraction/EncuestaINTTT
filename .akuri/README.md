---
file: README.md
doc-type: README
level: L3
area: A3
position: 1
title: AKURI_ENCUESTAINTTT
summary: Local corpus and declarations of the EncuestaINTTT project, colocated in the
  repo under .akuri/. A2 only points here (repo-location + akuri-root); the external
  Akuri-OMA tools and the documentation pack discover this folder.
---

# .akuri — EncuestaINTTT (documentación y declaraciones locales del proyecto)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: esta carpeta vive DENTRO del repositorio
(`EncuestaINTTT/.akuri/`) y contiene las declaraciones del proyecto y los datos que
consumen las herramientas de la metodología Akuri-OMA — colocalizados con el código y
versionados con sus ramas. Los artefactos externos los descubren desde aquí (LOCAL-FIRST).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=YAML · TECH=MARKDOWN · TECH=PSEUDO (mechanisms) · TECH=ADL (sketches) ·
TECH=PYTHON (gates deterministas).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=COLOCATED_CORPUS; ARCH_PATTERN=LOCAL_FIRST.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=REGISTRY (A2 pointer resuelve repo-location + akuri-root).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH.

## CHAPTER 3: THE CORPUS

### SECTION 01-CONTENIDO

WRITE INFO: las carpetas del corpus son:

| Carpeta | Contenido | Consumidor |
|---|---|---|
| `00-manifest/` | manifiesto del proyecto, source-layout, supradomains, data-model, analytics-platform (estrategia de desacoplamiento captura/analítica) | engine OMA |
| `01-tech-stack/` | tecnologías declaradas por capa | `oma_select` / `oma_context` |
| `02-instance-pool/` | instancias declaradas | `oma_instances` |
| `03-real-value/` | capacidades reales del backend Next.js | documentación técnica |
| `04-testing/` | protocolos de carga/resiliencia con gates deterministas | `oma_check` |
| `rules/` | reglas del proyecto (RULE + gate) + reglas locales del pack de documentación | `oma_context` / `oma_select` |
| `rulesets/` | rulesets del proyecto | `oma_context` / `oma_select` |
| `constructors/` | constructores project-local (L4): orquestadores + how-tos de analítica/reportería/acceso | `oma_check` / construcción |
| `tools/` | herramientas deterministas del proyecto | `oma_check` / `oma_build` |
| `docs/` | el corpus funcional: épicas → transversales (features verticales) + reglas locales | pack `akuri-oma-documentation` |

### SECTION 02-RELACION-CON-A2

WRITE INFO: A2 (`akuri-oma-specifications/03-projects/encuestaintt/`) mantiene SOLO el
puntero: `repo-location` + `akuri-root`. Todo lo demás vive aquí.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: verificar con los gates del pack de documentación sobre `.akuri/docs`
(`doc_check kind=transversal`) y con las reglas locales (`.akuri/rules/rules.yaml`).

### SECTION 02-CLOSING

WRITE INFO: A1 gobierna → A2 declara DÓNDE vive el proyecto → el proyecto declara y
documenta localmente en `.akuri/` → A3 construye/verifica.
