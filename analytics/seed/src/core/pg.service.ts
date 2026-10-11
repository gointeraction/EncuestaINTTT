import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool, type PoolClient } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { createWriteStream, createReadStream } from 'node:fs';
import { csvLine, type Cell } from './csv.js';

/** Acceso a PostgreSQL: consultas + carga masiva por COPY (streaming). */
@Injectable()
export class PgService implements OnModuleDestroy {
  private readonly log = new Logger(PgService.name);
  private readonly pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 4 });
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const r = await this.pool.query(sql, params as unknown[]);
    return r.rows as T[];
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async run(sql: string, params: unknown[]): Promise<void> {
    await this.pool.query(sql, params as unknown[]);
  }

  async currentDatabase(): Promise<string> {
    const rows = await this.query<{ db: string }>('select current_database() as db');
    return rows[0]?.db ?? '';
  }

  /** TRUNCATE acotado (en orden de dependencias) + reinicio de secuencias. */
  async truncate(tables: string[]): Promise<void> {
    await this.exec(`TRUNCATE ${tables.join(', ')} RESTART IDENTITY CASCADE`);
  }

  async copy(
    table: string,
    columns: string[],
    rows: Iterable<Cell[]> | AsyncIterable<Cell[]>,
    csvPath?: string,
  ): Promise<number> {
    const client: PoolClient = await this.pool.connect();
    const file = csvPath ? createWriteStream(csvPath) : null;
    if (file) file.write(columns.join(',') + '\n');
    try {
      const sql = `COPY ${table} (${columns.join(', ')}) FROM STDIN WITH (FORMAT csv)`;
      const sink = client.query(copyFrom(sql));
      const source = Readable.from(
        (async function* () {
          for await (const row of rows as AsyncIterable<Cell[]>) {
            const line = csvLine(row);
            if (file) file.write(line + '\n');
            yield line + '\n';
          }
        })(),
      );
      await pipeline(source, sink);
      const count = (sink as unknown as { rowCount?: number }).rowCount ?? 0;
      this.log.log(`COPY ${table}: ${count} filas${csvPath ? ` → ${csvPath}` : ''}`);
      return count;
    } finally {
      if (file) await new Promise<void>((res) => file.end(() => res()));
      client.release();
    }
  }

  /** Carga un CSV local a una tabla vía COPY (HEADER opcional). */
  async copyFromFile(
    table: string,
    columns: string[],
    filePath: string,
    header = false,
  ): Promise<number> {
    const client: PoolClient = await this.pool.connect();
    try {
      const opts = header ? 'FORMAT csv, HEADER true' : 'FORMAT csv';
      const sql = `COPY ${table} (${columns.join(', ')}) FROM STDIN WITH (${opts})`;
      const sink = client.query(copyFrom(sql));
      await pipeline(createReadStream(filePath), sink);
      const count = (sink as unknown as { rowCount?: number }).rowCount ?? 0;
      this.log.log(`COPY ${table} <- ${filePath}: ${count} filas`);
      return count;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
