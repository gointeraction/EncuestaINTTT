import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SEED_CONFIG, type CliFlags, type SeedConfig } from './config.js';
import { SeedCommand } from './commands/seed.command.js';
import { ResetCommand } from './commands/reset.command.js';
import { GenerateCommand } from './commands/generate.command.js';
import { SummarizeCommand } from './commands/summarize.command.js';
import { FixturesCommand } from './commands/fixtures.command.js';
import { LoadCommand } from './commands/load.command.js';

const USAGE =
  'uso: seed <seed|reset|generate|summarize> [--profile …] [--surveys N] [--responses N] [--questions N] [--legacy N] [--seed N]\n' +
  '     (sin comando → servidor HTTP dev-only en $PORT, por defecto 3161)';

function parseArgs(argv: string[]): CliFlags {
  const [command = '', ...rest] = argv;
  const flags: Record<string, string> = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg.startsWith('--')) {
      const [k, v] = arg.slice(2).split('=');
      flags[k] = v ?? rest[++i] ?? 'true';
    }
  }
  return {
    command,
    profile: flags.profile,
    seed: flags.seed,
    surveys: flags.surveys,
    questions: flags.questions,
    responses: flags.responses,
    legacy: flags.legacy,
    perType: flags['per-type'],
    dir: flags.dir,
  };
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2));

  // Modo HTTP (servicio dev-only): sin comando CLI.
  if (!flags.command) {
    try {
      const app = await NestFactory.create(AppModule.forRoot(flags));
      const port = Number(process.env.PORT ?? 3161);
      await app.listen(port, '0.0.0.0');
      console.log(`[seed] HTTP dev-only en :${port}`);
    } catch (err) {
      console.error(`[seed] ${(err as Error).message}`);
      process.exitCode = 1;
    }
    return;
  }

  // Modo CLI (comandos).
  let ctx: Awaited<ReturnType<typeof NestFactory.createApplicationContext>>;
  try {
    ctx = await NestFactory.createApplicationContext(AppModule.forRoot(flags), {
      logger: ['log', 'warn', 'error'],
    });
  } catch (err) {
    console.error(`[seed] ${(err as Error).message}`);
    process.exitCode = 1;
    return;
  }

  const config = ctx.get<SeedConfig>(SEED_CONFIG);
  console.log(
    `[seed] entorno=${config.appEnv} · base=${config.databaseName} · perfil=${config.profileName} · semilla=${config.rngSeed}`,
  );

  try {
    switch (flags.command) {
      case 'seed':
        await ctx.get(SeedCommand).run();
        break;
      case 'reset':
        await ctx.get(ResetCommand).run();
        break;
      case 'generate':
        await ctx.get(GenerateCommand).run();
        break;
      case 'summarize':
        await ctx.get(SummarizeCommand).run();
        break;
      case 'fixtures':
        await ctx.get(FixturesCommand).run({
          perType: flags.perType ? Number(flags.perType) : undefined,
          seed: flags.seed ? Number(flags.seed) : undefined,
          dir: flags.dir,
        });
        break;
      case 'load':
        await ctx.get(LoadCommand).run({ dir: flags.dir });
        break;
      default:
        console.error(USAGE);
        process.exitCode = 1;
    }
  } catch (err) {
    console.error(`[seed] error: ${(err as Error).message}`);
    process.exitCode = 1;
  } finally {
    await ctx.close();
  }
}

void main();
