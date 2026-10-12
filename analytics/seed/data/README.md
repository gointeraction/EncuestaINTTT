# Datos del seeder (Visión Cero)

- **`fixtures/`** — **única fuente** de datos simulados: un CSV por tipo de conductor con la
  forma REAL de `public.legacy_survey_responses` (`driverType` + `answers` JSON + `channel` +
  `device_id` + PII del sorteo). Es lo que carga el comando `load` (botón «Cargar CSV» en
  `/datos`) y, junto con ella, registra los `public.capture_devices`.
- Cualquier otro CSV en la **raíz** de este directorio es una **salida generada** por los
  comandos (`seed` escribe `legacy_survey_responses.csv` / `capture_devices.csv`). Está
  ignorado por `.gitignore` y puede borrarse sin problema.
