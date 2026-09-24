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

---
Task ID: 10
Agent: main
Task: Capture personal data (cédula + teléfono) for raffle participation.

Work Log:
- Added Prisma fields: participaSorteo, nombre, cedula, telefono, codigoSorteo + indexes; pushed to DB.
- Created `src/lib/sorteo.ts` with Venezuelan cédula validator (V-/E- + 6-8 digits, normalizes to canonical form), teléfono validator (0412/0414/0424/0416/0426 mobile prefixes, normalizes to +58-XXX-XXXXXXX), cedulaYaParticipa() uniqueness check, generateSorteoCode() (8 char, no ambiguous chars).
- Updated submit API: accepts optional `sorteo` object, validates, checks cédula uniqueness (409 on dup), generates códigoSorteo.
- Updated stats API: added `sorteo.participantes` count.
- Updated seed API: ~65% of synthetic records participate with realistic VE cédula/teléfono/código.
- Added admin API `/api/survey/participants` listing all raffle entrants (for the draw).
- Updated Zustand store: added "sorteo" view, sorteo data, codigoSorteo, participaSorteo.
- Created `SorteoForm` component: opt-in switch, terms notice, validated nombre/cédula/teléfono with live errors, server error handling (409), consent checkbox.
- Wired survey flow: last section button now says "Continuar al sorteo" (with Gift icon) → sorteo step → submit.
- Updated welcome: gold "¡Participa en el sorteo!" banner.
- Updated thank-you: gold confirmation box with códigoSorteo (or anonymous note).
- Updated dashboard: gold "Participantes en el sorteo" banner with count + "Ver lista" button opening a Dialog with full participant table (#, Nombre, Cédula, Teléfono, Código).
- Fixed bugs: button disabled-before-click preventing validation display; clearAnswers() order (set result AFTER clear).

Stage Summary:
- Lint clean. Dev server running, no errors.
- Server validation verified via curl: invalid cédula/phone → 400 with fieldErrors; valid → 200 + código; duplicate cédula → 409.
- E2E verified via Agent Browser + VLM:
  * Welcome shows gold sorteo banner.
  * Survey last section: "Continuar al sorteo" button (Gift icon).
  * Sorteo step: opt-in switch reveals nombre/cédula/teléfono; invalid data shows red errors (nombre min 3, cédula formato, teléfono móvil VE); valid data submits → thanks.
  * Thanks screen: gold box "¡Estás participando en el sorteo!" + 8-char code (e.g. PFAZJ983) + "guárdalo" note. (for anonymous: "Respondiste de forma anónima").
  * DB verified: Carmen Vega, E-18234567, +58-424-3344556, PFAZJ983 — normalization works (0424-3344556 → +58-424-3344556).
  * Dashboard: gold banner "Participantes en el sorteo: 58 (72% de 81)"; "Ver lista" opens Dialog with participant table.

---
Task ID: 11
Agent: main
Task: Add Venezuelan state + municipality dependent selection (load municipios by estado).

Work Log:
- Created `src/lib/venezuela-estados.ts` with all 24 states + Distrito Capital + Dependencias Federales, each with their complete list of municipalities + capital. Helpers: getMunicipiosByEstado(), getCapitalByEstado(), ESTADO_NOMBRES.
- Added "estado-municipio" to QuestionType union in survey-data.ts; replaced old free-text "ciudad" question with composite "ubicacion" question (type estado-municipio, required).
- Extended QuestionRenderer with new props (allAnswers, onMultiChange) and added "estado-municipio" case: two dependent Selects (Estado grid-sm:2). Estado select loads all 26 entities; Municipio is disabled + "Primero elige un estado" until estado chosen; on estado change, municipio resets. Shows hint "Capital del estado X · N municipio(s) disponible(s)".
- Added setMultiAnswer to Zustand store for composite-question updates.
- Updated SurveyForm: passes allAnswers + onMultiChange; added isAnswered() helper handling composite question (checks estado AND municipio); used in progress calc, missingRequired filter, and section-dot nav.
- Updated seed API: imports VENEZUELA_ESTADOS; generateAnswers handles estado-municipio specially (picks random estado + matching municipio); removed old "ciudad" case.

Stage Summary:
- Lint clean. Dev server running, no errors.
- Agent Browser verified: Estado dropdown shows all 26 entities; selecting Mérida enables Municipio + shows "Capital Mérida · 23 municipios"; Municipio loads Mérida's actual municipalities (Libertador, Rangel, Tovar, Zea...); selecting Tovar works; changing Estado to Zulia resets Municipio to placeholder; selecting Maracaibo + completing demographics → Siguiente passes validation (composite required question satisfied).
- Seed data verified: 80 responses with coherent estado/municipio pairs (e.g. Yaracuy/Sucre, Portuguesa/Agua Blanca, Distrito Capital/Libertador, Barinas/Barinas).

---
Task ID: 12
Agent: main
Task: Add many more indicators to the dashboard based on all survey questions.

Work Log:
- Audited all ~55 survey questions vs the 14 existing dashboard indicators → found ~30 questions without visualization.
- Extended stats API (`/api/survey/stats`) with 28 new aggregations + 4 new averages: byEstado, nivelEducativo, frecuenciaConduccion, categoriaLicencia, usoPrincipal, conduccionNocturna, climaLluvia, cascoTipo, cascoCertificado, equipamientoAdicional, elementosMoto, pasajerosExtra, presionTiempo, fatiga, siniestroAno, siniestroCausas, siniestroAtencion, senalizacion (scale), velocidadOpinion (scale), rebasesPeatones (scale), iluminacion, problemasVia, conoceLimitesVelocidad, conoceAlcoholemia, conoceSanciones, recibioCapacitacion, apoyoVisionCero, disposicionParticipar; avg.anosConduciendo, avg.kmDiarios, avg.horasDiarias, avg.rebasesPeatones.
- Added 4 new KPI cards (now 8 total, 2 rows): Años conduciendo (prom.), Km/día (prom.) + horas/día, Siempre usa casco, Licencia vigente.
- Extended ScaleCards from 3 to 6 (added Señalización vial, Respeto al límite de velocidad, Respeto a peatones).
- Created SectionDivider component (navy icon box + gold rule) and MiniDonut component (donut + center total + legend with counts/%).
- Added 8 themed sections with ~32 new charts:
  1. Ubicación y perfil socioeducativo (estado top12, nivel educativo)
  2. Experiencia y uso de la motocicleta (frecuencia, categoría licencia, uso principal, conducción nocturna, lluvia)
  3. Equipamiento de seguridad (tipo casco, certificación, equipamiento adicional, elementos moto)
  4. Comportamiento al conducir (pasajeros extra, presión tiempo, fatiga)
  5. Detalle de siniestros (por año, atención médica, causas víctimas)
  6. Infraestructura vial (iluminación, problemas frecuentes)
  7. Conocimiento de normativas (4 mini-donuts: límites, alcoholemia, sanciones, capacitación)
  8. Adopción de Visión Cero (apoyo, disposición a participar)
- Added 20 new lucide icons import.

Stage Summary:
- Lint clean. Dev server running, no console errors.
- Stats API verified: all 28 new indicators return data with realistic distributions.
- Agent Browser verified: 50 chart surfaces rendered (was 18), 8 section dividers present, 8 KPI cards (2 rows), MiniDonuts show center number + legend with counts/percentages.
- Dashboard went from 14 → ~46 indicators covering essentially all survey questions.

---
Task ID: 13
Agent: main
Task: Hide Dashboard from public access; make it a private URL with authentication; remove 3 info cards from home.

Work Log:
- Created `src/lib/admin-auth.ts`: HMAC-SHA256 signed httpOnly cookie session (7-day expiry), timing-safe password comparison, createAdminSession/destroyAdminSession/isAdminAuthed helpers.
- Set ADMIN_PASSWORD + ADMIN_SECRET in .env.
- Created API routes: POST /api/admin/login (validate password → set cookie), POST /api/admin/logout (clear cookie), GET /api/admin/session (check authed).
- Protected 3 APIs with isAdminAuthed(): /api/survey/stats, /api/survey/participants, /api/survey/seed → return 401 without session. Kept /api/survey/submit public.
- Added admin state to Zustand store: mode (public/admin), adminAuthed, adminChecking + setters.
- Created `src/components/admin/admin-login.tsx`: AdminLogin (password form, error toast, "Volver a la encuesta" link) + AdminHeader (navy bar with "Panel privado · Modo administrador" + Cerrar sesión button).
- Rewrote `src/app/page.tsx`: detects ?admin=1 query param on load → sets mode=admin → checks session via /api/admin/session → renders login (if not authed) or dashboard with AdminHeader (if authed). Public mode: removed Dashboard button from header nav (only Encuesta button remains).
- Updated welcome.tsx: removed the 3 info cards (Preguntas adaptadas / Confidencial / Dashboard público) — both the desktop right-side card AND the mobile stacked cards. Removed "Ver dashboard" button. Hero is now centered with just Comenzar encuesta + sorteo banner.
- Updated thank-you.tsx: removed "Ver dashboard de resultados" button (only "Realizar otra encuesta" remains). Removed unused BarChart3 import.

Stage Summary:
- Lint clean. Dev server running, no console errors.
- API protection verified via curl: stats/participants/seed → 401 without auth; submit → 200 (public).
- Agent Browser verified:
  * Public home: NO Dashboard button, NO 3 info cards, NO "Ver dashboard" button (VLM confirmed all 3 = NO).
  * Private URL /?admin=1: shows "Panel privado" login with password field.
  * Wrong password → stays on login (rejected).
  * Correct password (VisionCero2026!) → dashboard loads with 50 charts, KPI=81, AdminHeader with "Cerrar sesión".
  * Reload → session persists (cookie httpOnly).
  * Logout → redirects to public / (no admin).
- Private access URL: /?admin=1 (bookmarkable). Password in .env: VisionCero2026!
