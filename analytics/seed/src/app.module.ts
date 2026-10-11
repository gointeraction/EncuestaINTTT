import { Module, type DynamicModule } from '@nestjs/common';
import { SEED_CONFIG, loadConfig, type CliFlags } from './config.js';
import { PgService } from './core/pg.service.js';
import { SeedCommand } from './commands/seed.command.js';
import { ResetCommand } from './commands/reset.command.js';
import { GenerateCommand } from './commands/generate.command.js';
import { SummarizeCommand } from './commands/summarize.command.js';

@Module({})
export class AppModule {
  static forRoot(flags: CliFlags): DynamicModule {
    const config = loadConfig(flags); // valida guardas (aborta fuera de development)
    return {
      module: AppModule,
      providers: [
        { provide: SEED_CONFIG, useValue: config },
        { provide: PgService, useFactory: () => new PgService(config.databaseUrl) },
        SeedCommand,
        ResetCommand,
        GenerateCommand,
        SummarizeCommand,
      ],
    };
  }
}
