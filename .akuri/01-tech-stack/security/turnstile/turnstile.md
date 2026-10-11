---
file: turnstile.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: TURNSTILE
summary: Cloudflare Turnstile + Honeypot + IP rate-limit — the layered anti-bot
  protection of the public submission endpoint of EncuestaINTTT.
category: turnstile
scope: the turnstile specification
---

# Tech-Stack — Cloudflare Turnstile (security)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=DEFENCE_IN_DEPTH.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/security/turnstile/turnstile.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `security.turnstile` — Cloudflare Turnstile (CAPTCHA alternative), combined with a Honeypot field and IP rate-limit.

2. **major-version** — managed service — server verification in `src/lib/turnstile.ts` (`verifyTurnstileToken`); client widget in `src/components/survey/turnstile-widget.tsx`; keys in `.env` (`TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY`).

3. **layer** — security.

4. **scope-role** — gate the public `POST /api/survey/submit` and `POST /api/v1/public/surveys/[slug]/responses` against bots, before any write.

5. **capabilities** — 4-layer pipeline: (1) Nginx rate-limit → 429; (2) Honeypot hidden field → silent accept-no-save; (3) Turnstile server verify → 403; (4) cédula uniqueness → 409.

6. **depends-on** — `backend.nextjs-api`; `lib/rate-limit.ts`.

7. **canonical-files** — `src/lib/turnstile.ts`, `src/components/survey/turnstile-widget.tsx`, `.env`.

8. **compliance** — security: verify-on-server (never trust the client token), fail-closed (403 on invalid token), least-disclosure (honeypot answers are not persisted).

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
