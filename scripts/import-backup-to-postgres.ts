import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const backupPath = path.join(process.cwd(), "db", "sqlite_backup.json");
  if (!fs.existsSync(backupPath)) {
    console.error(`No se encontró el archivo de respaldo en: ${backupPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(backupPath, "utf-8");
  const records = JSON.parse(rawData);

  console.log(`Leídos ${records.length} registros desde sqlite_backup.json`);

  const formatted = records.map((r: any) => ({
    id: r.id,
    driverType: r.driverType,
    answers: r.answers,
    completedAt: new Date(r.completedAt),
    participaSorteo: Boolean(r.participaSorteo),
    nombre: r.nombre ?? null,
    cedula: r.cedula ?? null,
    telefono: r.telefono ?? null,
    codigoSorteo: r.codigoSorteo ?? null,
  }));

  const result = await prisma.surveyResponse.createMany({
    data: formatted,
    skipDuplicates: true,
  });

  console.log(`Migración completada con éxito. Registros insertados en PostgreSQL: ${result.count}`);
}

main()
  .catch((e) => {
    console.error("Error durante la migración a PostgreSQL:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
