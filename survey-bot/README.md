# survey-bot

Bot **independiente** que abre un navegador real (Chromium vía Playwright), **llena la encuesta Visión Cero y la envía como un usuario estándar**.

- **Desacoplado**: carpeta propia, `package.json` propio, **cero imports** del código de la app. Maneja la UI sólo por el DOM (rol/texto).
- No conoce el cuestionario: responde de forma genérica por **tipo de control** (radio, checkbox, select, número, texto) y resuelve el branching (`showIf`) re-evaluando la sección.

## Requisitos
- Node 18+ y navegadores de Playwright (`npx playwright install --with-deps chromium`), **o** Docker.

## Uso rápido (local)
```bash
cd survey-bot
cp .env.example .env         # ajusta BASE_URL, DRIVER_TYPE, COUNT...
npm install
npx playwright install --with-deps chromium
node src/run.js              # o: npm run run
```
Por defecto: `BASE_URL=http://localhost:80`, `DRIVER_TYPE=Motociclista activo`, `COUNT=1`.

## Uso con Docker (sin instalar navegadores en el host)
```bash
cd survey-bot
# habla con la captura del host por host.docker.internal
BASE_URL=http://host.docker.internal:80 COUNT=5 CONCURRENCY=2 docker compose up --build
```

## Configuración (variables de entorno)
| Variable | Por defecto | Descripción |
|---|---|---|
| `BASE_URL` | `http://localhost:80` | URL de la captura. |
| `DRIVER_TYPE` | `Motociclista activo` | Perfil a elegir (texto del botón). |
| `COUNT` | `1` | Encuestas a enviar. |
| `CONCURRENCY` | `1` | Pestañas en paralelo. |
| `THINK_MS` | `400` | Pausa entre interacciones (simula humano). |
| `HEADLESS` | `true` | `false` para ver el navegador. |
| `PARTICIPATE` | `false` | Rellenar el sorteo (nombre/cédula/teléfono). |

Salida: una línea por encuesta y un resumen (`OK/fallidas · avg · p95`); `exit 1` si alguna falla (sirve para CI).

## Límites (importante)
- **Turnstile**: en desarrollo la clave de prueba (`1x…`) pasa sola. En **producción** con claves reales, un navegador automatizado **no** la supera (es su propósito) → este bot es para **dev/staging y verificación funcional/UX**.
- **Rate limit por IP**: la captura limita envíos por IP. Para **volumen/estrés** usar el **seeder** (API, canal `seed`), no el navegador.

## Estructura
```
survey-bot/
├── src/config.js   # configuración por entorno
├── src/answer.js   # responde por tipo de control (genérico)
├── src/flow.js     # bienvenida→perfil→secciones→sorteo→enviar→gracias
├── src/run.js      # runner (count/concurrency/métricas)
├── Dockerfile · docker-compose.yml
└── .env.example
```
