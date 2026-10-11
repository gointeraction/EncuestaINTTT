import { Inject, Injectable } from '@nestjs/common';
import type { SurveySource } from '../../../shared/contracts/index.js';
import { PUBLIC_READ_PORT, type PublicReadPort } from './public-read.port.js';

@Injectable()
export class PublicReadService {
  constructor(
    @Inject(PUBLIC_READ_PORT) private readonly port: PublicReadPort,
  ) {}

  listSurveys(): Promise<SurveySource[]> {
    return this.port.listSurveys();
  }
}
