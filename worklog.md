# Worklog — Visión Cero Encuesta App

Project: Next.js survey application for "Propuesta de Encuesta Mejorada: Hacia una Visión Cero en Siniestros de Motocicletas".

Key requirement: The app must detect which questions apply to the respondent based on the **tipo de conductor** (driver type), using both `appliesTo` (driver-type filtering) and `showIf` (answer-based branching).

---
Task ID: 1
Agent: main
Task: Design comprehensive survey data model with driver-type conditional logic.

Work Log:
- Defined 6 driver types: motociclista activo, delivery/mensajero, mototaxista, ex-motociclista, familiar de víctima, otro conductor.
- Designed 10 survey sections with conditional `appliesTo` rules and answer-based `showIf` branching.
- Authored `/src/lib/survey-data.ts` as the single source of truth for questions, sections, and driver types.

Stage Summary:
- Survey definition module created at `src/lib/survey-data.ts`.
- Supports question types: radio, checkbox, text, textarea, scale (1-5), select, number.
- Conditional logic implemented via `appliesTo` (driver type array or "all") and `showIf` (questionId + value match).

---
Task ID: 2-7
Agent: main
Task: Build full survey app (Prisma, APIs, frontend survey + dashboard) and verify end-to-end.

Work Log:
- Created Prisma schema `SurveyResponse` model; pushed to SQLite via `bun run db:push`.
- Built API routes: POST/GET `/api/survey/submit`, GET `/api/survey/stats` (14 aggregations), POST `/api/survey/seed?count=N` (synthetic plausible data generator).
- Built Zustand store for view state + answers.
- Built components: Welcome, DriverTypeSelector, SurveyForm (section navigation + progress + showIf branching), QuestionRenderer (radio/checkbox/select/text/textarea/number/scale), ThankYou, Dashboard (KPIs + bar/pie/radial charts via recharts).
- Wired main `page.tsx` with sticky header + sticky footer (`min-h-screen flex flex-col`, `mt-auto`).
- Fixed lint: hooks-order in survey-form, removed unused imports.
- Fixed RadioGroup/Select controlled-uncontrolled warning (use "" fallback).

Stage Summary:
- Lint clean (0 errors). Dev server running on :3000, no console errors.
- Seeded 80 demo responses; then completed 1 real survey as "Familiar de víctima" → DB went 80 → 81.
- Agent Browser verified: welcome renders, driver-type selector shows per-type question counts (22–51), section dots filter by driver type (5 for Familiar vs 10 for Delivery), showIf branching bidirectional (licencia → categoria_licencia / motivo_no_licencia; siniestro → gravedad/ano/causas/atencion), submit → thank-you → DB persisted.
- Dashboard verified via VLM: 4 KPI cards (80 responses, 6 driver types, 39 avg age, 42 had siniestro = 53%), 18 recharts surfaces rendered (53 bar rects, 6 pie sectors), 14 chart titles including bar/pie/radial combo gauges (Percepción 2.5/5, Efectividad 2.6/5, Estado vías 2.4/5).
- Mobile (390px) verified: cards stack, no overflow, footer pushes down naturally on long content.

---
Task ID: 8
Agent: main
Task: Integrate institution logo (INTT - Instituto Nacional de Tránsito y Transporte) into the app.

Work Log:
- NOTE: uploaded file intt-new2.png did NOT arrive on server (upload folder empty). Built integration with graceful fallback so it works the moment the file is placed.
- Created `src/lib/institution.ts` (central config: acronym, name, logoSrc).
- Created `src/components/institution-logo.tsx` with InstitutionLogo + InstitutionBrand components: does HEAD fetch on logoSrc, renders <img> if 200, falls back to styled "INTT" gradient monogram if 404.
- Wired logo into: header (compact), welcome hero (xl), footer (with full institution name). Updated layout metadata to "INTT · Visión Cero · Encuesta...".
- Proved image-loading path works: created a real 240x240 PNG via sharp, placed at /public/intt-logo.png → 3 <img> elements rendered with naturalWidth=240 (header, welcome, footer). Then removed test file so clean monogram fallback shows.
- Lint clean. VLM-verified all 3 locations render the INTT monogram + institution name with no errors.

Stage Summary:
- Logo integration complete with automatic fallback.
- To show the real logo: place intt-new2.png at /home/z/my-project/public/intt-logo.png (or update logoSrc in src/lib/institution.ts to the actual filename). No code changes needed.

---
Task ID: 9
Agent: main
Task: Apply INTT (intt.gob.ve) institutional look and design to the survey app.

Work Log:
- Fetched https://www.intt.gob.ve/ via z-ai page_reader + downloaded official theme.json + style.css.
- Extracted full design system: 4 color families (Azul Marino #1c2454/#151c41, Azul Eléctrico #1c64f2/#1447ac, Amarillo Oro #ffc907/#e8b706, Rojo Carmesí #a70336), Gris scale, Georama font, radius scale (xs=2,sm=4,md=8,lg=16px).
- Downloaded real INTT logo (Logo-horizontal-texto-blanco-1.png, white text on navy) → /public/intt-logo.png.
- Rewrote globals.css: mapped all shadcn tokens (primary→electric, accent→gold, destructive→crimson, foreground→navy-800, chart palette→INTT colors) + added INTT utility classes (.intt-navy-bg, .intt-navy-gradient, .intt-gold-rule, .intt-hero-bg, .intt-shadow).
- Added Georama font (institutional) via next/font, set as body default.
- Rebuilt page.tsx: thin gov top-bar (ministry + website), navy gradient header with real INTT logo, gold CTA for Dashboard, navy institutional footer with gold rule + copyright.
- Rebuilt welcome.tsx: light-sky hero bg, navy heading with "Visión Cero" in electric-blue + gold underline, right-side feature card with navy header/gold accents.
- Restyled driver-type-selector, survey-form (progress dots, section icons, pills) with INTT electric-blue + gold.
- Restyled dashboard: chart COLORS array → INTT palette (#1c64f2,#151c41,#ffc907,#a70336,#6e76a3,#1447ac,#e8b706,#4983f5); KPI card icon backgrounds → institutional tints.
- Updated institution.ts: name → "Instituto Nacional de Transporte Terrestre", added ministry + website fields.

Stage Summary:
- Lint clean (0 errors/warnings). Dev server running, no console errors.
- VLM-verified: welcome matches INTT institutional style (navy header, sky hero, electric blue + gold accents, real INTT logo in header+footer). Dashboard uses INTT chart palette (verified via DOM: bars fill #1c64f2/#151c41/#ffc907/#a70336). Mobile 390px responsive intact.
- App now visually consistent with intt.gob.ve identity.
