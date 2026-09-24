# Especificación Técnica — INTT Visión Cero
## Encuesta de Siniestros de Motocicletas

> **Documento tipo Specification Driven Development (SDD)**
> Instituto Nacional de Transporte Terrestre (INTT) — Venezuela
> Versión: 1.0 · Última actualización: 2026

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura del sistema](#3-arquitectura-del-sistema)
4. [Modelo de dominio](#4-modelo-de-dominio)
5. [Lógica condicional de la encuesta](#5-lógica-condicional-de-la-encuesta)
6. [Esquema de base de datos](#6-esquema-de-base-de-datos)
7. [Especificación de APIs](#7-especificación-de-apis)
8. [Arquitectura de componentes](#8-arquitectura-de-componentes)
9. [Modelo de seguridad](#9-modelo-de-seguridad)
10. [Dashboard de indicadores](#10-dashboard-de-indicadores)
11. [Diseño visual (INTT)](#11-diseño-visual-intt)
12. [Configuración y despliegue](#12-configuración-y-despliegue)
13. [Restricciones del entorno](#13-restricciones-del-entorno)

---

## 1. Visión general

### 1.1 Propósito

Aplicación web para recolectar información sobre experiencia, percepciones y propuestas para reducir los siniestros de motocicleta, enmarcada en la política **Visión Cero** del INTT. La app:

- Presenta una **encuesta adaptativa** cuyas preguntas se filtran automáticamente según el tipo de conductor.
- Captura **datos personales opcionales** (cédula + teléfono) para un sorteo de incentivos.
- Expone un **dashboard privado** con ~46 indicadores agregados, accesible solo por URL autenticada.
- Protege el envío contra **bots** (Cloudflare Turnstile + rate limiting + honeypot).

### 1.2 Actores

| Actor | Acceso | Descripción |
|---|---|---|
| **Encuestado** | Público (`/`) | Responde la encuesta; opcionalmente participa en el sorteo. |
| **Administrador** | Privado (`/?admin=1`) | Accede al dashboard y lista de participantes del sorteo. |

### 1.3 Rutas

La app expone una **sola ruta visible** (`/`) con dos modos determinados por query param:

- `/` → Modo público: encuesta + sorteo + agradecimiento.
- `/?admin=1` → Modo admin: login → dashboard privado.

> Restricción del entorno: solo la ruta `/` es visible para el usuario. No se permiten rutas adicionales.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| Lenguaje | TypeScript | 5 |
| Estilos | Tailwind CSS + shadcn/ui (New York) | 4 |
| Base de datos | SQLite + Prisma ORM | 6 |
| Estado cliente | Zustand | 5 |
| Estado servidor | fetch + cache: no-store | — |
| Gráficas | Recharts | 2 |
| Animaciones | Framer Motion | 12 |
| Iconos | Lucide React | 0.525 |
| Formularios | React Hook Form + Zod | 7 / 4 |
| Tipografía | Georama (institucional INTT) + Geist | — |
| Anti-bot | Cloudflare Turnstile | — |
| Runtime | Bun | — |

---

## 3. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      Cliente (Browser)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Public App  │  │  Admin App   │  │  Turnstile Widget │  │
│  │  (encuesta)  │  │  (?admin=1)  │  │  (Cloudflare)     │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬────────┘  │
│         │                 │                     │           │
│         └────────┬────────┘                     │           │
└──────────────────┼──────────────────────────────┼───────────┘
                   │ fetch (relativo)             │ token
                   ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes (server)                │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐ │
│  │ /survey/   │ │ /survey/   │ │ /survey/ │ │ /admin/    │ │
│  │ submit     │ │ stats      │ │ seed     │ │ login|...  │ │
│  │ (público)  │ │ (admin)    │ │ (admin)  │ │ (auth)     │ │
│  └─────┬──────┘ └─────┬──────┘ └────┬─────┘ └─────┬──────┘ │
│        │              │              │              │        │
│        ▼              ▼              ▼              ▼        │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   │
│  │Turnstile│   │Admin Auth│   │Admin Auth│   │HMAC     │   │
│  │verify   │   │guard     │   │guard     │   │Cookie   │   │
│  └────┬────┘   └──────────┘   └──────────┘   └─────────┘   │
│       │                                                      │
│       ▼  ┌────────────────────────┐                          │
│  ┌─────┐ │  Prisma Client (SQLite)│                          │
│  │Rate │ │  ┌──────────────────┐  │                          │
│  │Limit│ │  │ SurveyResponse   │  │                          │
│  └─────┘ └──┴──────────────────┴──┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Decisiones arquitectónicas

- **API-only backend**: toda la lógica de servidor se expone vía API routes (no server actions).
- **Single route**: solo `/` es visible; el modo admin se controla por query param `?admin=1`.
- **Memoria para rate limit + sesión admin**: suficiente para una sola instancia. Para multi-instancia, migrar a Redis.
- **Sin middleware de cache**: las APIs usan `cache: "no-store"` para datos en tiempo real.

---

## 4. Modelo de dominio

### 4.1 Tipos de conductor (`DriverTypeId`)

6 perfiles que determinan qué preguntas aplica a cada encuestado:

| ID | Label | Descripción |
|---|---|---|
| `motociclista_activo` | Motociclista activo | Conduce moto por uso particular |
| `delivery` | Delivery / Mensajero | Conduce moto como trabajo (delivery) |
| `mototaxista` | Mototaxista | Transporte de pasajeros |
| `ex_motociclista` | Ex motociclista | Condujo en el pasado |
| `familiar` | Familiar de víctima | Familiar de víctima de siniestro |
| `otro_conductor` | Otro conductor / peatón | Carro, bicicleta o peatón |

### 4.2 Secciones de la encuesta (10)

| # | ID | Título | Aplica a |
|---|---|---|---|
| 1 | `demograficos` | Datos demográficos | Todos |
| 2 | `experiencia` | Experiencia como conductor | Motociclistas + ex |
| 3 | `uso_moto` | Uso de la motocicleta | Activos (no ex) |
| 4 | `equipamiento` | Equipamiento de seguridad | Motociclistas + ex |
| 5 | `comportamiento` | Comportamiento y prácticas | Activos (no ex) |
| 6 | `siniestros` | Experiencia con siniestros | Todos |
| 7 | `percepcion` | Percepción de causas y medidas | Todos |
| 8 | `infraestructura` | Infraestructura vial | Todos |
| 9 | `normativas` | Conocimiento de normativas | Motociclistas + ex |
| 10 | `propuestas` | Propuestas de mejora | Todos |

### 4.3 Tipos de pregunta (`QuestionType`)

| Tipo | Descripción | Renderizado |
|---|---|---|
| `radio` | Selección única | RadioGroup con tarjetas |
| `checkbox` | Selección múltiple | Checkboxes con tarjetas |
| `text` | Texto corto | Input |
| `textarea` | Texto largo | Textarea |
| `scale` | Escala 1-5 | Slider + medidor |
| `select` | Selección única (dropdown) | Select |
| `number` | Numérico | Input type=number + unit |
| `estado-municipio` | Compuesto dependiente | 2 Selects encadenados |

### 4.4 Total: ~55 preguntas distribuidas en 10 secciones

Cada tipo de conductor ve entre **22 y 51 preguntas** (filtrado por `appliesTo`).

---

## 5. Lógica condicional de la encuesta

El núcleo funcional. Dos mecanismos de filtrado:

### 5.1 `appliesTo` (filtro por tipo de conductor)

```typescript
appliesTo: DriverTypeId[] | "all"
```

- `"all"` → la pregunta/sección aplica a todos los tipos.
- `["delivery", "mototaxista"]` → solo aplica a esos tipos.

**Ejemplo**: la sección `uso_moto` tiene `appliesTo: ["motociclista_activo", "delivery", "mototaxista"]` — un `familiar` nunca la ve.

### 5.2 `showIf` (branching por respuestas previas)

```typescript
showIf?: { questionId: string; value: string | string[] }
```

- La pregunta solo se muestra si la respuesta a `questionId` coincide con `value`.
- `value` puede ser string o array de strings (OR lógico).

**Ejemplo**:
```typescript
{
  id: "categoria_licencia",
  showIf: { questionId: "licencia", value: ["Sí, vigente", "Sí, vencida"] }
}
```
→ Solo aparece si el encuestado respondió que tiene licencia (vigente o vencida).

### 5.3 Funciones de filtrado (`src/lib/survey-data.ts`)

| Función | Propósito |
|---|---|
| `getSectionsForDriverType(dt)` | Devuelve las secciones que aplican al tipo |
| `getActiveQuestions(section, dt, answers)` | Filtra preguntas por `appliesTo` + `showIf` resuelto |
| `countQuestionsForDriverType(dt)` | Cuenta preguntas aplicables (sin dependencias) |

### 5.4 Pregunta compuesta `estado-municipio`

Caso especial: el `id` es `ubicacion` pero guarda **dos claves** (`estado` + `municipio`) en el objeto `answers`. El `QuestionRenderer` recibe `allAnswers` + `onMultiChange` para manejar esto. La función `isAnswered()` en `SurveyForm` considera respondida solo si **ambas** claves tienen valor.

---

## 6. Esquema de base de datos

### 6.1 Modelo `SurveyResponse` (Prisma / SQLite)

```prisma
model SurveyResponse {
  id          String   @id @default(cuid())
  driverType  String   // DriverTypeId
  answers     String   // JSON string: { questionId: value }
  completedAt DateTime @default(now())

  // Datos personales para el sorteo (opcionales)
  participaSorteo Boolean @default(false)
  nombre          String?
  cedula          String? // formato: V-12345678 o E-12345678
  telefono        String? // formato: +58 412-1234567
  codigoSorteo    String? // 8 chars, generado al participar

  @@index([driverType])
  @@index([completedAt])
  @@index([participaSorteo])
  @@index([cedula])
}
```

### 6.2 Notas

- `answers` se guarda como **string JSON** (SQLite no soporta tipos compuestos Prisma). Se parsea con `JSON.parse` al leer.
- `cedula` tiene índice único lógico (validado en app: `cedulaYaParticipa()`) para impedir doble participación.
- `codigoSorteo` es un código de 8 caracteres alfanuméricos (sin caracteres ambiguos 0/O/1/I) para reclamar el premio.

### 6.3 Comandos

```bash
bun run db:push     # Sincroniza schema → DB (acepta data-loss)
bun run db:generate # Regenera Prisma Client
```

---

## 7. Especificación de APIs

### 7.1 APIs públicas (sin auth)

#### `POST /api/survey/submit`

Guarda una respuesta de encuesta. **Triple protección anti-bot**.

**Request body:**
```json
{
  "driverType": "familiar",
  "answers": { "edad": 30, "sexo": "Femenino", "estado": "Mérida", "municipio": "Tovar" },
  "sorteo": {
    "participa": true,
    "nombre": "María González",
    "cedula": "V-12345678",
    "telefono": "0412-1234567"
  },
  "turnstileToken": "XXXX.DUMMY.TOKEN.XXXX",
  "website": ""
}
```

**Respuestas:**
| Status | Caso | Body |
|---|---|---|
| 200 | OK | `{ id, ok, codigoSorteo?, participaSorteo? }` |
| 400 | driverType/answers faltantes o datos sorteo inválidos | `{ error, fieldErrors? }` |
| 403 | Turnstile inválido/faltante | `{ error }` |
| 409 | Cédula ya participó | `{ error }` |
| 429 | Rate limit excedido (5/10min por IP) | `{ error }`, header `Retry-After` |

**Orden de validación:** rate limit → honeypot → Turnstile → campos → sorteo → cédula duplicada → insert.

#### `GET /api/survey/submit`

Lista las últimas 200 respuestas (para administración). **Sin auth** actualmente (solo lectura agregada; considerar proteger si se expone).

---

### 7.2 APIs privadas (requieren cookie admin)

| Método + Ruta | Propósito | Guard |
|---|---|---|
| `GET /api/survey/stats` | Agregaciones para dashboard (~46 indicadores) | `isAdminAuthed()` |
| `GET /api/survey/participants` | Lista de participantes del sorteo | `isAdminAuthed()` |
| `POST /api/survey/seed?count=80` | Genera datos sintéticos de demo | `isAdminAuthed()` |

Todas devuelven `401 { error: "No autorizado" }` sin cookie de sesión válida.

### 7.3 APIs de autenticación admin

| Método + Ruta | Propósito |
|---|---|
| `POST /api/admin/login` | Valida contraseña → setea cookie httpOnly firmada |
| `POST /api/admin/logout` | Elimina cookie |
| `GET /api/admin/session` | Devuelve `{ authed: boolean }` |

**Login request:**
```json
{ "password": "VisionCero2026!" }
```
**Login response:** `200 { ok: true }` o `401 { error: "Contraseña incorrecta" }`.

### 7.4 Agregaciones del endpoint `/stats`

Devuelve ~46 indicadores:

- **Demografía**: total, byDriverType, bySex, ageGroups, byEstado (top 12), nivelEducativo, avg.edad
- **Experiencia**: licencia, categoriaLicencia, frecuenciaConduccion, avg.anosConduciendo
- **Uso de moto**: usoPrincipal, avg.kmDiarios, avg.horasDiarias, conduccionNocturna, climaLluvia
- **Equipamiento**: casco (uso/tipo/certificado), equipamientoAdicional, elementosMoto (checkbox)
- **Comportamiento**: velocidadOpinion (scale), usoCelular, alcohol, pasajerosExtra, rebasesPeatones (scale), presionTiempo, fatiga
- **Siniestros**: siniestro, siniestroGravedad, siniestroAno, siniestroCausas (checkbox), siniestroAtencion
- **Percepción**: causasPrincipales (checkbox), medidasEfectivas (checkbox), percepcionSeguridad (scale), efectividadControl (scale)
- **Infraestructura**: estadoVias (scale), senalizacion (scale), iluminacion, problemasVia (checkbox)
- **Normativas**: conoceLimitesVelocidad, conoceAlcoholemia, conoceSanciones, recibioCapacitacion
- **Visión Cero**: apoyoVisionCero, disposicionParticipar
- **Sorteo**: sorteo.participantes

---

## 8. Arquitectura de componentes

### 8.1 Árbol de componentes

```
app/page.tsx (Home — orquesta modos public/admin)
├── Public mode:
│   ├── Header (navy, logo INTT, btn "Encuesta")
│   ├── Welcome                        (hero + banner sorteo)
│   ├── DriverTypeSelector             (6 cards de perfil)
│   ├── SurveyForm                     (secciones + progreso + navegación)
│   │   └── QuestionRenderer           (8 tipos de pregunta)
│   │       └── [estado-municipio]     (2 selects dependientes)
│   ├── SorteoForm                     (opt-in + datos personales + Turnstile)
│   │   └── TurnstileWidget            (Cloudflare Turnstile)
│   ├── ThankYou                       (confirmación + código sorteo)
│   └── Footer (navy institucional)
│
└── Admin mode (?admin=1):
    ├── AdminLogin                      (password form)
    ├── AdminHeader                     (barra "Panel privado" + logout)
    ├── Dashboard                       (~46 indicadores en 8 secciones)
    │   ├── KpiCard × 8
    │   ├── ScaleCard × 6              (medidores radiales 1-5)
    │   ├── ChartCard × ~25            (bar/pie charts)
    │   ├── MiniDonut × 4              (conocimiento normativas)
    │   ├── SectionDivider × 8         (separadores temáticos)
    │   └── Dialog (lista participantes)
    └── Footer (admin)
```

### 8.2 Estado global (Zustand — `src/store/survey-store.ts`)

```typescript
interface SurveyState {
  view: View;              // welcome | driver | survey | sorteo | thanks | dashboard
  mode: AppMode;           // public | admin
  adminAuthed: boolean;
  adminChecking: boolean;
  driverType: DriverTypeId | null;
  answers: Record<string, AnswerValue>;
  savedId: string | null;
  codigoSorteo: string | null;
  participaSorteo: boolean;
  sorteo: SorteoData;      // { participa, nombre, cedula, telefono }
}
```

El store es **client-side en memoria**. No persiste entre recargas (excepto la cookie admin que sí persiste 7 días).

### 8.3 Componentes clave

#### `QuestionRenderer`
Renderiza 8 tipos de pregunta. Props extendidas para soportar `estado-municipio`:
- `value`, `onChange` — pregunta simple
- `allAnswers`, `onMultiChange` — pregunta compuesta

#### `SurveyForm`
- Navegación por secciones con progreso global (cuenta preguntas activas respondidas / total).
- Validación de requeridos antes de avanzar (toast si faltan).
- Mini-navegación de secciones (dots de progreso).
- Botón última sección: "Continuar al sorteo" (con ícono Gift).

#### `SorteoForm`
- Switch opt-in para participar.
- Validación en vivo de cédula/teléfono venezolanos.
- **Turnstile widget** + honeypot oculto.
- Maneja errores 403 (Turnstile) / 409 (cédula dup) / 429 (rate limit).

#### `Dashboard`
- 8 KPIs (2 filas de 4).
- Banner dorado de participantes del sorteo + botón "Ver lista" → Dialog.
- 6 ScaleCards (medidores radiales).
- 8 secciones temáticas con ~32 charts (bar/pie/radial).
- 4 MiniDonuts (conocimiento de normativas).

---

## 9. Modelo de seguridad

### 9.1 Capas de protección anti-bot (envío de encuesta)

```
Request POST /api/survey/submit
  │
  ▼
1. Rate Limit (IP)      → 429 si > 5 envíos / 10 min
  │
  ▼
2. Honeypot (website)   → silent ok si relleno (bot engañado)
  │
  ▼
3. Turnstile verify     → 403 si token inválido/faltante
  │ (server-side call a challenges.cloudflare.com)
  ▼
4. Validación campos    → 400 si faltan
  │
  ▼
5. Validación sorteo    → 400 si cédula/tel inválidos
  │
  ▼
6. Cédula única         → 409 si ya participó
  │
  ▼
7. INSERT en DB         → 200 + codigoSorteo
```

### 9.2 Autenticación admin (`src/lib/admin-auth.ts`)

- **Cookie httpOnly** firmada con HMAC-SHA256 (`ADMIN_SECRET`).
- Payload: `"admin.<expires>.<signature>"`. Validez 7 días.
- Comparación de contraseña **timing-safe** (`timingSafeEqual`).
- Funciones: `createAdminSession()`, `destroyAdminSession()`, `isAdminAuthed()`.

### 9.3 Protección de APIs privadas

Todas las APIs `/stats`, `/participants`, `/seed` invocan `isAdminAuthed()` al inicio → `401` si no hay cookie.

### 9.4 Variables de entorno (`.env`)

| Variable | Propósito | Valor default (test) |
|---|---|---|
| `DATABASE_URL` | Conexión SQLite | `file:.../custom.db` |
| `ADMIN_PASSWORD` | Contraseña panel admin | `VisionCero2026!` |
| `ADMIN_SECRET` | Secreto HMAC cookies | (hex 64 chars) |
| `TURNSTILE_SITE_KEY` | Site key público (client) | `1x0000...AA` (test, always-pass) |
| `TURNSTILE_SECRET_KEY` | Secret key (server verify) | `1x0000...AA` (test) |

> **Producción**: reemplazar `TURNSTILE_*` con claves reales de `dash.cloudflare.com → Turnstile`. Cambiar `ADMIN_PASSWORD`. Rotar `ADMIN_SECRET`.

---

## 10. Dashboard de indicadores

### 10.1 KPIs (8 tarjetas)

| KPI | Fuente |
|---|---|
| Total respuestas | `stats.total` |
| Tipos de conductor | `byDriverType` con count>0 |
| Edad promedio | `avg.edad` |
| Han tenido siniestro | `siniestro` sin "No, nunca" |
| Años conduciendo (prom.) | `avg.anosConduciendo` |
| Km/día (prom.) | `avg.kmDiarios` (+ horas/día) |
| Siempre usa casco | `casco` == "Siempre" |
| Licencia vigente | `licencia` == "Sí, vigente" |

### 10.2 Secciones temáticas (8)

1. **Ubicación y perfil socioeducativo** — estado (top 12), nivel educativo
2. **Experiencia y uso de la motocicleta** — frecuencia, categoría licencia, uso principal, nocturna, lluvia
3. **Equipamiento de seguridad** — tipo casco, certificación, equipamiento adicional, elementos moto
4. **Comportamiento al conducir** — pasajeros extra, presión tiempo, fatiga
5. **Detalle de siniestros** — por año, atención médica, causas (víctimas)
6. **Infraestructura vial** — iluminación, problemas frecuentes
7. **Conocimiento de normativas** — 4 mini-donuts (límites, alcoholemia, sanciones, capacitación)
8. **Adopción de Visión Cero** — apoyo, disposición a participar

### 10.3 Escalas radiales (6)

Percepción de seguridad · Efectividad del control · Estado de vías · Señalización · Respeto al límite de velocidad · Respeto a peatones.

### 10.4 Participantes del sorteo

- Banner dorado con conteo + % del total.
- Botón "Ver lista" → Dialog con tabla (#, Nombre, Cédula, Teléfono, Código).

---

## 11. Diseño visual (INTT)

### 11.1 Paleta institucional (extraída de `intt.gob.ve/theme.json`)

| Familia | Slug | Hex | Uso |
|---|---|---|---|
| Azul Marino | navy-700 / 800 | `#1c2454` / `#151c41` | Header, footer, texto principal |
| Azul Eléctrico | electric-500 / 700 | `#1c64f2` / `#1447ac` | Primary, CTA, links |
| Amarillo Oro | gold-500 / 600 | `#ffc907` / `#e8b706` | Acento, reglas, sorteo |
| Rojo Carmesí | carmesi-500 | `#a70336` | Destructive, alertas |
| Gris | gris-100/300/700 | `#f5f5f5`/`#e0e0e0`/`#616161` | Fondos, bordes, texto muted |

### 11.2 Tipografía

- **Georama** (institucional INTT) — familia principal, vía `next/font/google`.
- Geist como fallback.

### 11.3 Tokens CSS (`globals.css`)

- `--primary` → electric-500
- `--accent` → gold-500
- `--destructive` → carmesi-500
- `--foreground` → navy-800
- `--chart-1..5` → paleta INTT

### 11.4 Utilidades institucionales

- `.intt-navy-bg` / `.intt-navy-gradient` — fondos navy
- `.intt-gold-rule` — regla dorada degradada
- `.intt-hero-bg` — fondo hero (azul cielo)
- `.intt-shadow` / `.intt-shadow-lg` — sombras suaves

### 11.5 Logo

- Archivo: `/public/intt-logo.png` (horizontal, texto blanco sobre navy).
- Componente `InstitutionLogo` con fallback automático (monograma "INTT" si el archivo falta).

---

## 12. Configuración y despliegue

### 12.1 Requisitos

- Bun runtime
- Node.js compatible (Next.js 16)
- Puerto 3000 (auto dev server)

### 12.2 Setup inicial

```bash
# 1. Instalar dependencias
bun install

# 2. Configurar .env (ver sección 9.4)
#    - DATABASE_URL, ADMIN_PASSWORD, ADMIN_SECRET, TURNSTILE_*

# 3. Sincronizar DB
bun run db:push

# 4. Iniciar dev server
bun run dev    # http://localhost:3000
```

### 12.3 Datos de demostración

Desde el dashboard admin, botón **"Cargar datos demo"** → `POST /api/survey/seed?count=80` genera 80 respuestas sintéticas plausibles (con estado/municipio coherentes, ~65% participantes del sorteo).

### 12.4 Producción

```bash
bun run build   # build standalone
bun run start   # sirve el build
```

### 12.5 Accesos

| Acceso | URL | Credenciales |
|---|---|---|
| Encuesta pública | `/` | Sin auth |
| Panel admin | `/?admin=1` | Password: `VisionCero2026!` |

---

## 13. Restricciones del entorno

El sandbox cloud donde corre la app impone:

1. **Una sola ruta visible**: solo `/` (no crear rutas adicionales).
2. **Una sola API base**: las peticiones cross-service usan query param `?XTransformPort=<port>` (gateway Caddy).
3. **Sin puertos directos**: las APIs y WebSockets deben usar paths relativos.
4. **z-ai-web-dev-sdk solo en backend**: nunca importar en código cliente.
5. **Rate limit + sesión admin en memoria**: para multi-instancia, migrar a Redis.
6. **Turnstile en modo test**: las claves de prueba siempre pasan; reemplazar con claves reales en producción.

---

## Apéndice A: Estructura de archivos

```
src/
├── app/
│   ├── page.tsx                      # Orquestador public/admin
│   ├── layout.tsx                    # Root layout (Georama font)
│   ├── globals.css                   # Tokens INTT + utilidades
│   └── api/
│       ├── survey/
│       │   ├── submit/route.ts       # POST encuesta (protegido)
│       │   ├── stats/route.ts        # GET dashboard (admin)
│       │   ├── participants/route.ts # GET sorteo (admin)
│       │   └── seed/route.ts         # POST demo data (admin)
│       └── admin/
│           ├── login/route.ts        # POST auth
│           ├── logout/route.ts       # POST logout
│           └── session/route.ts      # GET check auth
├── components/
│   ├── survey/
│   │   ├── welcome.tsx
│   │   ├── driver-type-selector.tsx
│   │   ├── survey-form.tsx
│   │   ├── question-renderer.tsx
│   │   ├── sorteo-form.tsx
│   │   ├── turnstile-widget.tsx
│   │   └── thank-you.tsx
│   ├── dashboard/
│   │   └── dashboard.tsx             # ~46 indicadores
│   ├── admin/
│   │   └── admin-login.tsx
│   ├── institution-logo.tsx
│   └── ui/                           # shadcn/ui (54 componentes)
├── lib/
│   ├── survey-data.ts                # ~55 preguntas, 10 secciones, 6 driver types
│   ├── venezuela-estados.ts          # 26 entidades + municipios
│   ├── sorteo.ts                     # Validadores cédula/teléfono VE
│   ├── admin-auth.ts                 # HMAC cookie session
│   ├── turnstile.ts                  # CF Turnstile server verify
│   ├── rate-limit.ts                 # Rate limiter IP en memoria
│   ├── institution.ts                # Config INTT
│   ├── db.ts                         # Prisma client singleton
│   └── utils.ts
├── store/
│   └── survey-store.ts               # Zustand
└── prisma/
    └── schema.prisma                 # SurveyResponse model
```

## Apéndice B: Glosario

- **Visión Cero**: política de que ninguna muerte es aceptable en vías.
- **Turnstile**: producto anti-bot de Cloudflare (alternativa a reCAPTCHA, sin fricción).
- **Honeypot**: campo oculto que solo los bots rellenan.
- **Rate limit**: límite de peticiones por IP en ventana de tiempo.
- **SDD (Specification Driven Development)**: metodología donde la spec guía el desarrollo.

---

*Documento generado como especificación técnica de la aplicación. Para cambios, actualizar este documento antes de implementar.*
