import { Injectable, inject } from '@angular/core';
import { SessionService } from '../../../../../../core/session.service';
import type { WelcomeStateContract } from '../contracts/welcome.state.contract';

@Injectable()
export class WelcomeStateService implements WelcomeStateContract {
  private readonly session = inject(SessionService);

  readonly user = this.session.user;
}
