import { Module } from '@nestjs/common';
import { ReadModelModule } from '../../analytics/read-model/read-model.module.js';
import { SchedulerService } from './scheduler.service.js';

@Module({
  imports: [ReadModelModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
