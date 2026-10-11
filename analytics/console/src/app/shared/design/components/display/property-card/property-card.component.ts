import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { DsIconComponent } from '../icon/icon.component';
import { DsBadgeComponent, DsBadgeTone } from '../badge/badge.component';

export type DsPropertyViewMode = 'grid' | 'list' | 'compact';

export type DsPropertyStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | (string & {});

export type DsPropertyListingType =
  | 'FOR_SALE'
  | 'RENTAL_MONTHLY'
  | 'RENTAL_DAILY'
  | 'RENTAL_WEEKEND'
  | 'RENTAL_SEASONAL'
  | (string & {});

/**
 * ds-property-card — real-estate property card (grid/list).
 * Purely presentational: knows real-estate vocabulary (beds, baths, status) but
 * ZERO dependency on backend DTOs. Consumers map domain data → DsPropertyData.
 * Ported from DsPropertyCard (design-system reference), adapted to --ds-* tokens,
 * ds-icon (Lucide) and ds-badge. NO FontAwesome, NO hardcoded colors.
 */
@Component({
  selector: 'ds-property-card',
  standalone: true,
  imports: [
    NgOptimizedImage,CurrencyPipe, DsIconComponent, DsBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; height: 100%;' },
  template: `
    @if (viewMode() === 'grid') {
      <div class="ds-pc ds-pc--grid" (click)="select.emit($event)"
           [class.ds-pc--selected]="selected()">
        <div class="ds-pc__media">
          @if (status()) {
            <div class="ds-pc__status">
              <ds-badge [tone]="statusTone()">{{ status() }}</ds-badge>
            </div>
          }
          @if (data().isFeatured) {
            <div class="ds-pc__featured">
              <ds-badge tone="warning">{{ featuredLabel() }}</ds-badge>
            </div>
          }
          @if (data().imageUrl) {
            <img [ngSrc]="data().imageUrl!" alt="Property image"
                 (click)="$event.stopPropagation(); viewDetails.emit($event)"
                 (error)="onImageError($event)"
                 class="ds-pc__img" width="24" height="24" />
          } @else {
            <div class="ds-pc__img-placeholder" (click)="$event.stopPropagation(); viewDetails.emit($event)">
              <ds-icon name="building" size="xl"/>
            </div>
          }
        </div>

        <div class="ds-pc__body">
          <p class="ds-pc__price-label">{{ priceLabel() }}</p>
          <div class="ds-pc__price-row">
            <p class="ds-pc__price">{{ data().price | currency: 'USD': 'symbol': '1.0-0' }}</p>
            <div class="ds-pc__actions">
              @if (!hideActions()) {
                <button type="button" class="ds-pc__icon-btn" (click)="toggleFavorite.emit($event)"
                        [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'">
                  <ds-icon [name]="isFavorite() ? 'heart' : 'heart'" [color]="isFavorite() ? 'var(--ds-color-state-danger)' : 'var(--ds-text-muted)'" size="sm"/>
                </button>
                <button type="button" class="ds-pc__icon-btn" (click)="viewDetails.emit($event)" aria-label="View details">
                  <ds-icon name="eye" size="sm"/>
                </button>
                @if (data().canEdit) {
                  <button type="button" class="ds-pc__icon-btn" (click)="edit.emit($event)" aria-label="Edit property">
                    <ds-icon name="edit" size="sm"/>
                  </button>
                }
              }
            </div>
          </div>
          @if (data().roi) {
            <span class="ds-pc__roi"><ds-badge tone="success">{{ data().roi }}% ROI</ds-badge></span>
          }
          @if (data().listingType) {
            <p class="ds-pc__listing-type">{{ listingLabel(data().listingType) }}</p>
          }
          <h3 class="ds-pc__title" [title]="data().title">{{ data().title }}</h3>
          <p class="ds-pc__location">{{ data().location }}</p>
          <p class="ds-pc__category">{{ data().categoryName || 'Property' }} · {{ data().typeName || 'Standard' }}</p>
          <div class="ds-pc__specs">
            @if (data().bedrooms) {
              <span class="ds-pc__spec" title="Bedrooms">
                <ds-icon name="activity" size="sm"/>{{ data().bedrooms }}
              </span>
            }
            @if (data().bathrooms) {
              <span class="ds-pc__spec" title="Bathrooms">
                <ds-icon name="users" size="sm"/>{{ data().bathrooms }}
              </span>
            }
            @if (data().squareFeet) {
              <span class="ds-pc__spec" title="Square Feet">
                <ds-icon name="map-pin" size="sm"/>{{ data().squareFeet }} sqft
              </span>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="ds-pc ds-pc--list" (click)="select.emit($event)"
           [class.ds-pc--selected]="selected()">
        <div class="ds-pc__media ds-pc__media--list">
          @if (data().imageUrl) {
            <img [ngSrc]="data().imageUrl!" alt="Property"
                 (click)="$event.stopPropagation(); viewDetails.emit($event)"
                 (error)="onImageError($event)" class="ds-pc__img" width="24" height="24" />
          } @else {
            <div class="ds-pc__img-placeholder" (click)="$event.stopPropagation(); viewDetails.emit($event)">
              <ds-icon name="building" size="lg"/>
            </div>
          }
        </div>
        <div class="ds-pc__body ds-pc__body--list">
          <div class="ds-pc__list-top">
            <div class="ds-pc__list-tags">
              @if (status()) {
                <ds-badge [tone]="statusTone()">{{ status() }}</ds-badge>
              }
              @if (data().isFeatured) {
                <ds-badge tone="warning">{{ featuredLabel() }}</ds-badge>
              }
              @if (data().roi) {
                <ds-badge tone="success">{{ data().roi }}% ROI</ds-badge>
              }
            </div>
            <div class="ds-pc__actions">
              @if (!hideActions()) {
                <button type="button" class="ds-pc__icon-btn" (click)="toggleFavorite.emit($event)"
                        [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'">
                  <ds-icon [name]="isFavorite() ? 'heart' : 'heart'" [color]="isFavorite() ? 'var(--ds-color-state-danger)' : 'var(--ds-text-muted)'" size="sm"/>
                </button>
                <button type="button" class="ds-pc__icon-btn" (click)="viewDetails.emit($event)" aria-label="View details">
                  <ds-icon name="eye" size="sm"/>
                </button>
                @if (data().canEdit) {
                  <button type="button" class="ds-pc__icon-btn" (click)="edit.emit($event)" aria-label="Edit property">
                    <ds-icon name="edit" size="sm"/>
                  </button>
                }
              }
            </div>
          </div>
          <p class="ds-pc__price-label">{{ priceLabel() }}</p>
          <p class="ds-pc__price">
            {{ data().price | currency: 'USD': 'symbol': '1.0-0' }}
            @if (data().listingType) {
              <span class="ds-pc__listing-type">{{ listingLabel(data().listingType) }}</span>
            }
          </p>
          <h3 class="ds-pc__title" [title]="data().title">{{ data().title }}</h3>
          <p class="ds-pc__location">{{ data().location }}</p>
          <div class="ds-pc__specs ds-pc__specs--list">
            <span class="ds-pc__category">{{ data().categoryName || 'Property' }} · {{ data().typeName || 'Standard' }}</span>
            @if (data().bedrooms) {
              <span class="ds-pc__spec" title="Bedrooms"><ds-icon name="activity" size="xs"/>{{ data().bedrooms }}</span>
            }
            @if (data().bathrooms) {
              <span class="ds-pc__spec" title="Bathrooms"><ds-icon name="users" size="xs"/>{{ data().bathrooms }}</span>
            }
            @if (data().squareFeet) {
              <span class="ds-pc__spec" title="Square Feet"><ds-icon name="map-pin" size="xs"/>{{ data().squareFeet }} sqft</span>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; height: 100%; }

    .ds-pc--grid {
      display: flex; flex-direction: column;
      background: var(--ds-surface-card); color: var(--ds-surface-card-on);
      border: 1px solid var(--ds-border-default);
      border-radius: var(--ds-radius-lg);
      box-shadow: var(--ds-shadow-sm);
      overflow: hidden;
      transition: box-shadow var(--ds-duration-normal) var(--ds-ease-standard);
      cursor: pointer;
    }
    .ds-pc--grid:hover { box-shadow: var(--ds-shadow-lg); }
    .ds-pc--selected { border-color: var(--ds-color-brand-primary); box-shadow: var(--ds-shadow-md); }

    .ds-pc__media { position: relative; aspect-ratio: 16 / 10; background: var(--ds-surface-muted); }
    .ds-pc__media--list { width: var(--ds-size-48); height: 100%; }
    .ds-pc__img { width: 100%; height: 100%; object-fit: cover; }
    .ds-pc__img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--ds-text-muted); }
    .ds-pc__status { position: absolute; top: var(--ds-space-2); left: var(--ds-space-2); z-index: 10; }
    .ds-pc__featured { position: absolute; bottom: var(--ds-space-2); left: var(--ds-space-2); z-index: 10; }

    .ds-pc__body { display: flex; flex-direction: column; gap: var(--ds-space-1); padding: var(--ds-space-4); flex: 1; }
    .ds-pc__price-label { font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-semibold); color: var(--ds-text-muted); text-transform: uppercase; letter-spacing: var(--ds-letter-spacing-wide); margin: 0; }
    .ds-pc__price-row { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-2); }
    .ds-pc__price { font-weight: var(--ds-font-weight-bold); font-size: var(--ds-text-heading-2); color: var(--ds-surface-card-on); line-height: 1.2; margin: 0; }
    .ds-pc__actions { display: flex; align-items: center; gap: var(--ds-space-1); }
    .ds-pc__icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ds-size-6); height: var(--ds-size-6);
      border: none; background: transparent; cursor: pointer;
      border-radius: var(--ds-radius-full);
      transition: background-color var(--ds-duration-fast) var(--ds-ease-standard);
    }
    .ds-pc__icon-btn:hover { background: var(--ds-surface-hover); }
    .ds-pc__roi { margin: 0; }
    .ds-pc__listing-type { font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-bold); color: var(--ds-text-muted); text-transform: uppercase; letter-spacing: var(--ds-letter-spacing-tight); margin: 0; }
    .ds-pc__title { font-size: var(--ds-text-body); font-weight: var(--ds-font-weight-medium); color: var(--ds-surface-card-on); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0; }
    .ds-pc__location { font-size: var(--ds-text-caption); color: var(--ds-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0; }
    .ds-pc__category { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; }
    .ds-pc__specs { display: flex; flex-wrap: wrap; gap: var(--ds-space-2); margin-top: var(--ds-space-2); }
    .ds-pc__specs--list { align-items: center; }
    .ds-pc__spec { display: inline-flex; align-items: center; gap: var(--ds-space-1); font-size: var(--ds-text-small); color: var(--ds-text-muted); }

    .ds-pc--list {
      display: flex;
      background: var(--ds-surface-card); color: var(--ds-surface-card-on);
      border: 1px solid var(--ds-border-default);
      border-radius: var(--ds-radius-standard);
      box-shadow: var(--ds-shadow-sm);
      overflow: hidden; height: 100%;
      transition: box-shadow var(--ds-duration-normal) var(--ds-ease-standard);
      cursor: pointer;
    }
    .ds-pc--list:hover { box-shadow: var(--ds-shadow-md); }
    .ds-pc--list .ds-pc--selected { border-color: var(--ds-color-brand-primary); }
    .ds-pc__body--list { flex: 1; min-width: 0; padding: var(--ds-space-3) var(--ds-space-4); }
    .ds-pc__list-top { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-2); margin-bottom: var(--ds-space-2); }
    .ds-pc__list-tags { display: flex; align-items: center; gap: var(--ds-space-1); }
    .ds-pc--list .ds-pc__price-label { margin-top: var(--ds-space-1); }
    .ds-pc--list .ds-pc__price { font-size: var(--ds-text-body); }
    .ds-pc--list .ds-pc__listing-type { font-size: var(--ds-text-caption); }
  `,
})
export class DsPropertyCardComponent {
  readonly data = input.required<DsPropertyData>();

  readonly viewMode = input<DsPropertyViewMode>('grid');
  readonly selected = input(false);
  readonly isFavorite = input(false);
  readonly hideActions = input(false);

  readonly priceLabel = input('Asking Price');
  readonly featuredLabel = input('Recommended');

  readonly viewDetails = output<Event>();
  readonly edit = output<Event>();
  readonly toggleFavorite = output<Event>();
  readonly select = output<Event>();

  protected status(): string | undefined {
    return this.data().status;
  }

  protected statusTone(): DsBadgeTone {
    const s = (this.data().status || '').toUpperCase();
    if (s === 'AVAILABLE' || s === 'FOR_SALE') return 'success';
    if (s === 'SOLD') return 'danger';
    if (s === 'RESERVED' || s === 'PENDING') return 'warning';
    return 'info';
  }

  protected listingLabel(type: DsPropertyListingType | undefined): string {
    const labels: Record<string, string> = {
      FOR_SALE: 'Fix and Flip',
      RENTAL_MONTHLY: 'Monthly Rental',
      RENTAL_DAILY: 'Daily Rental',
      RENTAL_WEEKEND: 'Weekend Rental',
      RENTAL_SEASONAL: 'Seasonal Rental',
    };
    return (type && labels[type]) || type || 'Property';
  }

  protected onImageError(_event: Event): void {
    /* no-op: the image error fallback is handled by the placeholder state. */
  }
}

export interface DsPropertyData {
  id: string;
  title: string;
  imageUrl?: string;
  price: number;
  status?: DsPropertyStatus;
  listingType?: DsPropertyListingType;
  location?: string;
  categoryName?: string;
  typeName?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  isFeatured?: boolean;
  roi?: number;
  canEdit?: boolean;
}