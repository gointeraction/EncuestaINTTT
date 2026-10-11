import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * ds-surface — the SURFACE mechanism (standalone + OnPush): a background LAYER for cards
 * and pages. `type` picks the background: solid / gradient / image / video; `src` feeds
 * image/video; `overlay` is a color+opacity for legibility (token-driven); `fit`/`position`
 * control the media framing. The projected content renders ABOVE the background (z-10).
 * A card with a photo background or a page with a video hero are ds-surface variants,
 * never custom CSS.
 */
@Component({
  selector: 'ds-surface',
  standalone: true, imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-surface', style: 'position: relative; display: block; overflow: hidden;' },
  template: `
    <div class="ds-surface__bg" [attr.data-type]="type()">
      @switch (type()) {
        @case ('image') {
          <img class="ds-surface__media" [ngSrc]="src()" [alt]="alt()" [attr.loading]="loading()"
               [style.object-fit]="fit()" [style.object-position]="position()" width="24" height="24" />
        }
        @case ('video') {
          <video class="ds-surface__media" [attr.src]="src()" [muted]="muted()" [autoplay]="autoplay()"
                 [loop]="loop()" playsinline [style.object-fit]="fit()"
                 [style.object-position]="position()"></video>
        }
        @case ('gradient') {
          <div class="ds-surface__gradient" [style.background]="gradient()"></div>
        }
        @default {
          <div class="ds-surface__solid" [style.background]="background()"></div>
        }
      }
      @if (overlay(); as ov) {
        <div class="ds-surface__overlay" [style.background]="ov"></div>
      }
    </div>
    <div class="ds-surface__content" style="position: relative; z-index: 10;"><ng-content/></div>
  `,
  styles: `
    .ds-surface__bg { position: absolute; inset: 0; z-index: 0; }
    .ds-surface__media { width: 100%; height: 100%; display: block; }
    .ds-surface__gradient, .ds-surface__solid { position: absolute; inset: 0; }
    .ds-surface__overlay { position: absolute; inset: 0; }
  `,
})
export class DsSurfaceComponent {
  readonly type = input<'solid' | 'gradient' | 'image' | 'video'>('solid');
  readonly src = input('');
  readonly alt = input('');
  readonly background = input('var(--ds-surface-page)');
  readonly gradient = input('var(--ds-gradient-primary-to-accent)');
  readonly overlay = input('');
  readonly fit = input<'cover' | 'contain'>('cover');
  readonly position = input('center');
  readonly loading = input<'lazy' | 'eager'>('lazy');
  readonly muted = input(true);
  readonly autoplay = input(true);
  readonly loop = input(true);
}