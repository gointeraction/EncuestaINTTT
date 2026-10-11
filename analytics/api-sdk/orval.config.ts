import { defineConfig } from 'orval';

// Genera el api-sdk (cliente Angular tipado) DENTRO de la consola
// (analytics/console/src/app/shared/api-sdk) a partir del OpenAPI del back-office.
export default defineConfig({
  encuestaintt: {
    input: { target: './openapi.json' },
    output: {
      target: '../console/src/app/shared/api-sdk/index.ts',
      schemas: '../console/src/app/shared/api-sdk/model',
      client: 'angular',
      mode: 'single',
      mock: false,
    },
  },
});
