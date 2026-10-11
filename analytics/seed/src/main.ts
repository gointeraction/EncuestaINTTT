import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SEED_CONFIG, type CliFlags, type SeedConfig } from './config.js';
import { SeedCommand } from './commands/seed.command.js';
import { ResetCommand } from './commands/reset.command.js';
import { GenerateCommand } from './commands/generate.command.js';
import { SummarizeCommand } from './commands/summarize.command.js';

const USAGE =
  'uso: seed <seed|reset|generate|summarize> [--profile small|medium|large|xl] [--seed N]';

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
  };
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2));

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
