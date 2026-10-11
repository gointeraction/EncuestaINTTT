import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';
import type { DsExternalIconName } from '../../display/icon/ds-external-icon-registry';
import type { DsIconName, DsIconSize } from '../../display/icon/ds-icon-registry';

export type DsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'brand-outline'
  | 'ghost'
  | 'premium'
  | 'destructive'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';
export type DsButtonSize = 'sm' | 'md' | 'lg';
export type DsButtonType = 'button' | 'submit' | 'reset';

/**
 * ds-button — universal, accessible, multipurpose button (standalone + OnPush).
 * R2 (2026-09-08): renders a REAL native control. With `href` it renders an `<a>`
 * (link button); otherwise a native `<button type="button|submit|reset">`. That
 * gives native focus tab, Enter/Space, :focus-visible, form submit and
 * screen-reader semantics — no fake buttons. Selector is a single `ds-button`
 * element (A2 build-on-demand gate: one selector per component).
 * Variants: primary / secondary / brand-outline / ghost / premium (gold, use only
 * when corporately justified) / destructive (canonical destructive, alias of
 * danger) / danger / success / warning / info. Sizes: sm / md / lg
 * (min-height targets ≥32px).
 * Inputs: type, href, icon (Lucide name), iconOnly, loading (spinner +
 * aria-busy + blocked), ariaLabel, tooltip. Additive; API-compatible with all
 * existing consumers.
 * Styled ONLY with design tokens + Tailwind utilities.
 */
@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (href()) {
      <a
        class="ds-button__control {{ controlClasses() }}"
        [href]="(disabled() || loading()) ? null : href()"
        [attr.aria-label]="ariaLabel() || hostAriaLabel"
        [attr.aria-disabled]="(disabled() || loading()) ? 'true' : null"
        [attr.aria-busy]="loading() ? 'true' : null"
        [attr.tabindex]="(disabled() || loading()) ? '-1' : null"
        [attr.title]="tooltip() || hostTitle"
        (click)="onControlClick($event)"
      >
        @if (icon()) { <ds-icon [name]="icon()" [size]="iconSize()"/> }
        @if (loading()) { <span class="ds-button__spin" aria-hidden="true"></span> }
        <ng-content/>
      </a>
    } @else {
      <button
        [type]="type()"
        class="ds-button__control {{ controlClasses() }}"
        [disabled]="disabled() || loading()"
        [attr.aria-label]="ariaLabel() || hostAriaLabel"
        [attr.aria-busy]="loading() ? 'true' : null"
        [attr.title]="tooltip() || hostTitle"
      >
        @if (icon()) { <ds-icon [name]="icon()" [size]="iconSize()"/> }
        @if (loading()) { <span class="ds-button__spin" aria-hidden="true"></span> }
        <ng-content/>
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    /* ── Base control — the real <button>/<a> rendered by ds-button. ── */
    .ds-button__control {
      display: inline-flex; align-items: center; justify-content: center;
      gap: var(--ds-component-button-icon-gap);
      border-radius: var(--ds-component-button-radius);
      font-family: var(--ds-component-button-font);
      font-size: var(--ds-component-button-size);
      font-weight: var(--ds-font-weight-medium);
      cursor: pointer; text-decoration: none; user-select: none;
      border: 1px solid transparent;
      transition:
        transform var(--ds-duration-fast) var(--ds-ease-standard),
        box-shadow var(--ds-duration-fast) var(--ds-ease-standard),
        background-color var(--ds-duration-fast) var(--ds-ease-standard),
        border-color var(--ds-duration-fast) var(--ds-ease-standard),
        color var(--ds-duration-fast) var(--ds-ease-standard);
    }

    /* Disabled: flat, no interactions. */
    .ds-button__control:disabled,
    .ds-button__control[aria-disabled="true"] {
      cursor: not-allowed; opacity: 0.45; box-shadow: none;
    }
    /* Block: the control fills the host width (author sizes the host with w-full/w-1/2, etc.). */
    :host([data-block]) .ds-button__control { width: 100%; }
    /* Hover: the control LIFTS (elevation) and casts a shadow — colour NEVER changes. */
    .ds-button__control:hover:not(:disabled):not([aria-disabled="true"]) {
      transform: translateY(-3px);
      box-shadow: var(--ds-shadow-lg);
    }
    .ds-button__control:active:not(:disabled):not([aria-disabled="true"]) {
      transform: translateY(0);
      box-shadow: var(--ds-shadow-sm);
    }
    /* R2: visible focus (WCAG 2.2) — never removed without a replacement. */
    .ds-button__control:focus-visible {
      outline: none;
      box-shadow: var(--ds-component-button-focus-ring);
    }

    /* ── Variants ── */
    .ds-button__control.ds-button--primary {
      background: var(--ds-component-button-primary-bg);
      color: var(--ds-component-button-primary-on);
      border: 1px solid var(--ds-component-button-primary-border);
    }
    .ds-button__control.ds-button--secondary {
      background: var(--ds-component-button-secondary-bg);
      color: var(--ds-component-button-secondary-on);
      border: 1px solid var(--ds-component-button-secondary-border);
    }
    .ds-button__control.ds-button--brand-outline {
      background: transparent;
      color: var(--ds-component-button-outline-on);
      border: 1px solid var(--ds-component-button-primary-border);
    }
    .ds-button__control.ds-button--ghost { background: transparent; border: none; }
    .ds-button__control.ds-button--premium {
      background: var(--ds-component-button-premium-bg);
      color: var(--ds-component-button-premium-on);
      border: 1px solid var(--ds-component-button-premium-border);
    }
    .ds-button__control.ds-button--destructive {
      background: var(--ds-component-button-destructive-bg);
      color: var(--ds-component-button-destructive-on);
      border: 1px solid var(--ds-component-button-destructive-border);
    }
    .ds-button__control.ds-button--danger {
      background: var(--ds-component-button-danger-bg);
      color: var(--ds-component-button-danger-on);
      border: 1px solid var(--ds-component-button-danger-bg);
    }
    .ds-button__control.ds-button--success {
      background: var(--ds-component-button-success-bg);
      color: var(--ds-component-button-success-on);
      border: 1px solid var(--ds-component-button-success-bg);
    }
    .ds-button__control.ds-button--warning {
      background: var(--ds-component-button-warning-bg);
      color: var(--ds-component-button-warning-on);
      border: 1px solid var(--ds-component-button-warning-bg);
    }
    .ds-button__control.ds-button--info {
      background: var(--ds-component-button-info-bg);
      color: var(--ds-component-button-info-on);
      border: 1px solid var(--ds-component-button-info-bg);
    }

    /* ── Sizes — min-height enforces WCAG 2.2 target size (>=32px) WITHOUT shrinking text. ── */
    .ds-button__control.ds-button--size-sm {
      padding: var(--ds-space-1) var(--ds-space-3);
      font-size: var(--ds-text-small);
      min-height: var(--ds-component-button-min-height-sm);
    }
    .ds-button__control.ds-button--size-md {
      padding: var(--ds-component-button-padding-y) var(--ds-component-button-padding-x);
      font-size: var(--ds-component-button-size);
      min-height: var(--ds-component-button-min-height-md);
    }
    .ds-button__control.ds-button--size-lg {
      padding: var(--ds-space-3) var(--ds-space-5);
      font-size: var(--ds-text-body);
      min-height: var(--ds-component-button-min-height-lg);
    }
    .ds-button__control.ds-button-icon-only {
      padding: var(--ds-space-2);
      aspect-ratio: 1;
    }

    /* ── Loading spinner — currentColor, token-driven, no literal colors. ── */
    .ds-button__spin {
      width: var(--ds-component-button-loading-size);
      height: var(--ds-component-button-loading-size);
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: var(--ds-radius-full);
      animation: ds-button-spin 0.8s linear infinite;
    }
    @keyframes ds-button-spin {
      to { transform: rotate(360deg); }
    }
    .ds-button__control.ds-button--loading { cursor: progress; }
  `,
})
export class DsButtonComponent {
  readonly variant = input<DsButtonVariant>('primary');
  readonly size = input<DsButtonSize>('md');
  readonly active = input(false);
  readonly disabled = input(false);
  readonly type = input<DsButtonType>('button');
  readonly href = input('');
  readonly icon = input<DsIconName | DsExternalIconName | ''>('');
  readonly iconOnly = input(false);
  readonly loading = input(false);
  readonly ariaLabel = input('');
  readonly tooltip = input('');

  protected readonly hostAriaLabel: string | null = null;
  protected readonly hostTitle: string | null = null;

  protected readonly iconSize = computed<DsIconSize>(() => (this.size() === 'sm' ? 'sm' : 'md'));

  protected readonly controlClasses = computed(() => {
    const c: string[] = [`ds-button--${this.variant()}`, `ds-button--size-${this.size()}`];
    if (this.iconOnly()) c.push('ds-button-icon-only');
    if (this.loading()) c.push('ds-button--loading');
    if (this.active()) c.push('ds-button--active');
    return c.join(' ');
  });

  protected onControlClick(event: Event): void {
    const blocked = this.disabled() || this.loading();
    if (blocked && this.href()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}