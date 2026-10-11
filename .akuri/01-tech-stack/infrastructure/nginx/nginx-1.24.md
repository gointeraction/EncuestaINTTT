---
file: nginx-1.24.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: NGINX_1_24
summary: Nginx 1.24+ — the perimetral reverse proxy of EncuestaINTTT. Brotli/Gzip,
  microcache, request rate-limit, and Zero-Trust restriction of admin/stats routes to
  intranet/VPN.
category: nginx
scope: the nginx specification
---

# Tech-Stack — Nginx 1.24 (infrastructure)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=REVERSE_PROXY; ARCH_PATTERN=EDGE_SECURITY.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/infrastructure/nginx/nginx-1.24.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `infrastructure.nginx` — the perimetral reverse proxy / load balancer (Zona 1 DMZ, VLAN 10).

2. **major-version** — 1.24 — provisioned by `install.sh` on Ubuntu/Debian.

3. **layer** — infrastructure.

4. **scope-role** — terminates the edge in the compose stack, compresses (Gzip), rate-limits submissions and applies Zero-Trust to the private dashboard routes; proxies to `app:3001`.

5. **capabilities** — `proxy_pass` to the `encuesta_app` upstream, `limit_req` (10 r/m on `/api/survey/submit`), `allow`/`deny` by subred, `/healthz`.

6. **depends-on** — `infrastructure.docker-compose` (runs as the `proxy` service).

7. **canonical-files** — `deploy/nginx/default.conf`; legacy host config in `install.sh`.

8. **compliance** — infrastructure: admin-routes-restricted (`/api/admin/*`, `/api/survey/stats`, `/api/survey/participants`, `/api/survey/seed`, `/admin` → 403 from public), rate-limit-at-edge, Brotli/Gzip.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
