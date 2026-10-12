# Datos del seeder (Visión Cero)

Todo lo de este directorio se **genera a demanda** (nada se versiona, ver `.gitignore`):

- **`fixtures/`** — un CSV por **tipo de conductor** (realistas, ~300 en total), con la forma
  real de `public.legacy_survey_responses` (`driverType` + `answers` JSON + `channel` +
  `device_id` + PII del sorteo). Se generan con «Generar CSV» y se cargan con «Cargar CSV».
- **`datasets/`** — un CSV por **volumen** (`scale-10k`, `scale-100k`, `scale-500k`,
  `scale-1m`) para medir responsividad. El de 1M pesa ~1 GB.

Ambos los produce/consumen los comandos del seeder y se gestionan desde el módulo
`test-data` de la consola (SOLO development): generar · listar · cargar · borrar.
