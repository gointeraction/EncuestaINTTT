import { Injectable, inject, signal } from '@angular/core';
import { AdminUsersDataService } from '../data/admin-users.data.service';
import type { AdminUsersStateContract } from '../contracts/admin-users.state.contract';
import type { AdminUser, PasswordResetRow } from '../models/admin-users.model';

@Injectable()
export class AdminUsersStateService implements AdminUsersStateContract {
  private readonly data = inject(AdminUsersDataService);

  readonly loading = signal(false);
  readonly users = signal<AdminUser[]>([]);
  readonly requests = signal<PasswordResetRow[]>([]);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [users, requests] = await Promise.all([this.data.users(), this.data.requests()]);
      this.users.set(users);
      this.requests.set(requests);
    } finally {
      this.loading.set(false);
    }
  }

  async setStatus(id: string, status: string): Promise<void> {
    await this.data.patchUser(id, { status });
    await this.load();
  }

  async setRole(id: string, roleName: string): Promise<void> {
    await this.data.patchUser(id, { roleName });
    await this.load();
  }

  async resolveRequest(id: string, status: 'approved' | 'rejected'): Promise<void> {
    await this.data.patchRequest(id, status);
    await this.load();
  }
}
