import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="login">
      <h1>Acceso del personal</h1>
      <form (ngSubmit)="submit()" #f="ngForm">
        <label>Correo
          <input name="email" type="email" [(ngModel)]="email" required autocomplete="username" />
        </label>
        <label>Clave
          <input name="password" type="password" [(ngModel)]="password" required autocomplete="current-password" />
        </label>
        @if (error(); as e) { <p role="alert">{{ e }}</p> }
        <button type="submit" [disabled]="loading() || f.invalid">
          {{ loading() ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </section>
  `,
})
export class LoginComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.session.login(this.email, this.password);
      await this.router.navigateByUrl('/');
    } catch {
      this.error.set('Credenciales inválidas o servicio no disponible.');
    } finally {
      this.loading.set(false);
    }
  }
}
