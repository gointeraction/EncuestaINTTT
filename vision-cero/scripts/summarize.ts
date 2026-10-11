import { PrismaClient } from "@prisma/client";
import { parseSurveyRows, computeSurveyStats } from "../src/lib/survey-analytics";

const prisma = new PrismaClient();

async function main() {
  const startTime = Date.now();
  console.log("=================================================");
  console.log(" [PROCESO DE SUMARIZACIÓN] Encuesta INTT Visión Cero");
  console.log("=================================================");
  console.log(" Iniciando lectura y cálculo pre-agregado...");

  // Seleccionamos solo las columnas necesarias para el cálculo analítico
  const rows = await prisma.surveyResponse.findMany({
    select: {
      driverType: true,
      answers: true,
      completedAt: true,
      participaSorteo: true,
    },
  });

  const rowCount = rows.length;
  console.log(` -> Encuestas leídas en base de datos: ${rowCount.toLocaleString("es-VE")}`);

  // Parsear y procesar con el motor unificado de analítica
  const parsed = parseSurveyRows(rows);
  const stats = computeSurveyStats(parsed, rowCount);

  // Agregar metadatos de sincronización
  const summaryPayload = {
    ...stats,
    _generatedAt: new Date().toISOString(),
    _executionMs: Date.now() - startTime,
    _totalRecords: rowCount,
  };

  // Guardar en la tabla de resumen optimizado
  await prisma.surveySummary.upsert({
    where: { id: "latest" },
    create: {
      id: "latest",
      calculatedAt: new Date(),
      totalCount: rowCount,
      summaryData: JSON.stringify(summaryPayload),
    },
    update: {
      calculatedAt: new Date(),
      totalCount: rowCount,
      summaryData: JSON.stringify(summaryPayload),
    },
  });

  const totalDuration = Date.now() - startTime;
  console.log(` -> Resumen persistido en 'SurveySummary' (id: 'latest')`);
  console.log(` -> Tamaño aproximado del payload: ${(JSON.stringify(summaryPayload).length / 1024).toFixed(2)} KB`);
  console.log(` -> Tiempo total de procesamiento: ${totalDuration} ms`);
  console.log("=================================================");
  console.log(" Proceso de sumarización finalizado con éxito.");
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("[ERROR] Falló la sumarización:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
