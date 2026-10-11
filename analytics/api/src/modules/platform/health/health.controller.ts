import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator.js';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string; service: string } {
    return { status: 'ok', service: 'encuestaintt-analytics-api' };
  }
}
