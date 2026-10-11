import { Inject, Injectable, Logger } from '@nestjs/common';
import { createWriteStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { csvLine } from '../core/csv.js';
import { tables } from '../core/dataset.js';

/** generate — escribe los CSV a disco (inspección / pruebas de volumen). */
@Injectable()
export class GenerateCommand {
  private readonly log = new Logger('generate');

  constructor(@Inject(SEED_CONFIG) private readonly config: SeedConfig) {}

  async run(): Promise<void> {
    const dir = process.env.SEED_DATA_DIR ?? join(process.cwd(), 'data');
    mkdirSync(dir, { recursive: true });
    for (const table of tables(this.config.rngSeed, this.config.profile)) {
      const file = join(dir, `${table.name.split('.').pop()}.csv`);
      const out = createWriteStream(file);
      out.write(table.columns.join(',') + '\n');
      let n = 0;
      for await (const row of table.rows()) {
        out.write(csvLine(row) + '\n');
        n++;
      }
      await new Promise<void>((res, rej) =>
        out.end((err?: Error | null) => (err ? rej(err) : res())),
      );
      this.log.log(`CSV ${file}: ${n} filas`);
    }
  }
}
