import { Module } from '@nestjs/common';
import { IdentityModule } from '../../platform/identity/identity.module.js';
import { ReadModelService } from './read-model.service.js';
import { SummarizationService } from './summarization.service.js';
import { SummarizationController } from './summarization.controller.js';

@Module({
  imports: [IdentityModule],
  controllers: [SummarizationController],
  providers: [ReadModelService, SummarizationService],
  exports: [ReadModelService, SummarizationService],
})
export class ReadModelModule {}
