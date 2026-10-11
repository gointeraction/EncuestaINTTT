---
file: encuestaintt-docs.md
doc-type: INSTANCE
level: L4
area: A2
position: 1
title: ENCUESTAINTTT_DOCS
summary: The EncuestaINTTT documentation instance — the SDD/architecture docs under
  docs/ plus the colocated functional corpus under .akuri/docs/.
layer: documentation
technology: markdown
instance: The EncuestaINTTT documentation (technical docs + functional corpus).
repo-location: /mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT
path: docs/
entry-point: docs/SPECIFICATION.md, docs/sdd/spec.md
status: declared
ruleset: []
---

# Instance Pool — encuestaintt-docs (Markdown — REAL)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: 1. **instance** — the EncuestaINTTT documentation instance.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=MARKDOWN · TECH=ADL · TECH=PSEUDO.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=COLOCATED_CORPUS; ARCH_PATTERN=EPIC_TRANSVERSAL.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=DOC_AS_CONTRACT.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=NUMBERED_SECTIONS.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 02-instance-pool/documentation/encuestaintt-docs.md
> Produced by: how-to-write-a-instance-pool.template.md
> Level: L4

## Fields

1. **instance** — the documentation instance: technical docs (SDD, arquitectura, guía on-prem,
   sumarización) plus the functional corpus (épicas → transversales).

2. **repo-location** — `EncuestaINTTT/docs/` (technical) and `EncuestaINTTT/.akuri/docs/` (functional).

3. **entry-point** — `docs/SPECIFICATION.md` (SDD v1.1) and `docs/sdd/spec.md` (SDD v1.2).

4. **naming** — technical docs UPPER_SNAKE_CASE; functional corpus `docs/epics/<slug>/transversal-<feature>.md`.

5. **version-reality** — SDD v1.2.0 (docs/sdd/), manifest v1.1 (docs/SPECIFICATION.md).

6. **independent-core** — documentation, not deployment; consumed by the documentation pack gates.

## content (declared)

- Technical: `SPECIFICATION.md`, `ARQUITECTURA_REQUERIDA.md`, `GUIA_IMPLEMENTACION_ONPREMISES.md`,
  `PROCESO_SUMARIZACION.md`, `sdd/{constitution,spec,plan,tasks,data-model,contracts,checklist}.md`.
- Functional corpus (colocated): `.akuri/docs/` with local rules `.akuri/rules/rules.yaml`
  (Spanish-only check `check-documento-en-es.py`).

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
