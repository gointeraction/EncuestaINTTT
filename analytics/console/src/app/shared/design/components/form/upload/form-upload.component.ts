import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsFormUploadState = 'default' | 'error' | 'success';

export type DsFormUploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export interface DsFormUploadFile {
  /** Stable local id (name + size) used as track key. */
  id: string;
  name: string;
  size: number;
  status: DsFormUploadStatus;
  progress: number;
  error?: string;
  /** Reserved for the consumer to attach a response/metadata. */
  response?: unknown;
}

export interface DsFormUploadConfig {
  /** When set, ds-form-upload calls this to actually upload. Otherwise it emits `upload`. */
  upload?: (file: File) => Promise<void>;
}

/**
 * ds-form-upload — file upload with drag & drop (standalone + OnPush).
 * Drag & drop or click-to-browse (hidden input). Maintains a file list with
 * size, per-file progress bar and remove action. Two integration modes:
 *   1. Decoupled: emits `upload` (file) — the consumer uploads via the real
 *      SDK (e.g. ResourcesFilesStorageService) and calls `markDone(name)`.
 *   2. Injected: pass an `upload` callback via `[config]`; ds-form-upload awaits it
 *      and updates each file's progress/status automatically.
 * Token-driven (--dsu-*).
 */
@Component({
  selector: 'ds-form-upload',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ds-form-upload--error]': "state() === 'error'",
    '[class.ds-form-upload--success]': "state() === 'success'",
  },
  template: `
    <div class="dsu" [attr.data-upload]="name()">
      @if (label(); as l) {
        <label class="dsu__label">{{ l }}</label>
      }

      <div class="dsu__dropzone"
           [class.dsu__dropzone--dragover]="dragging()"
           [class.dsu__dropzone--disabled]="disabled()"
           role="button"
           [attr.aria-label]="dropTitle() || 'Upload files'"
           [attr.tabindex]="disabled() ? null : 0"
           [attr.aria-disabled]="disabled() || null"
           (dragover.prevent)="onDragOver()"
           (dragleave)="onDragLeave()"
           (drop)="onDrop($event)"
           (click)="openBrowser()"
           (keydown)="onDropzoneKeydown($event)">
        <ds-icon class="dsu__upload-icon" name="upload" size="lg"/>
        <p class="dsu__title">{{ dropTitle() || 'Drag files here, or browse' }}</p>
        <p class="dsu__hint">{{ hint() || acceptText() }}</p>
        <input #fileInput
               type="file"
               class="dsu__input"
               [multiple]="multiple()"
               [accept]="accept()"
               (change)="onFilesSelected($event)"
               (click)="$event.stopPropagation()" />
      </div>

      @if (state() === 'error' && message(); as m) {
        <p class="dsu__message dsu__message--error">{{ m }}</p>
      }

      @if (files().length) {
        <ul class="dsu__list">
          @for (f of files(); track f.id) {
            <li class="dsu__file" [class.dsu__file--error]="f.status === 'error'">
              <ds-icon class="dsu__file-icon" name="file-text" size="sm"/>
              <div class="dsu__file-body">
                <div class="dsu__file-top">
                  <span class="dsu__file-name">{{ f.name }}</span>
                  <span class="dsu__file-size">{{ formatSize(f.size) }}</span>
                </div>
                <div class="dsu__progress" [attr.role]="'progressbar'" [attr.aria-valuenow]="f.progress">
                  <div class="dsu__progress-bar" [style.width.%]="f.progress"></div>
                </div>
                <p class="dsu__file-status">
                  @if (f.error) {
                    <span class="dsu__file-status--error">{{ f.error }}</span>
                  } @else if (f.status === 'uploading') {
                    <span>{{ f.progress }}%</span>
                  } @else if (f.status === 'done') {
                    <span class="dsu__file-status--done"><ds-icon name="check" size="xs"/> Done</span>
                  }
                </p>
              </div>
              <button type="button" class="dsu__remove" (click)="remove(f.id)" aria-label="Remove file">
                <ds-icon name="x" size="sm"/>
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    :host { display: block; width: 100%; }
    .dsu { display: flex; flex-direction: column; gap: var(--ds-space-3); }
    .dsu__label {
      font-size: var(--ds-text-label); font-weight: var(--ds-font-weight-medium);
      color: var(--ds-surface-elevated-on);
    }
    .dsu__dropzone {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--ds-space-2);
      width: 100%; padding: var(--ds-space-6);
      border: 2px dashed var(--ds-border-input); border-radius: var(--ds-form-radius-standard);
      background: var(--ds-surface-muted); cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .dsu__dropzone:hover, .dsu__dropzone--dragover {
      border-color: var(--ds-status-info); background: var(--ds-surface-hover);
    }
    .dsu__dropzone--disabled { cursor: not-allowed; opacity: 0.55; }
    /* R6: the dropzone is keyboard-focusable (role=button) — visible ring. */
    .dsu__dropzone:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--ds-status-info) 35%, transparent);
    }
    .dsu__upload-icon { color: var(--ds-text-muted); }
    .dsu__title { font-size: var(--ds-text-body); font-weight: var(--ds-font-weight-medium); color: var(--ds-surface-elevated-on); }
    .dsu__hint { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .dsu__input { display: none; }
    .dsu__message { font-size: var(--ds-text-caption); color: var(--ds-status-danger); }

    .dsu__list { display: flex; flex-direction: column; gap: var(--ds-space-2); list-style: none; margin: 0; padding: 0; }
    .dsu__file {
      display: flex; align-items: center; gap: var(--ds-space-3);
      padding: var(--ds-space-2) var(--ds-space-3);
      border: 1px solid var(--ds-border-default); border-radius: var(--ds-radius-md);
      background: var(--ds-surface-elevated);
    }
    .dsu__file--error { border-color: var(--ds-status-danger); }
    .dsu__file-icon { color: var(--ds-text-muted); }
    .dsu__file-body { flex: 1; display: flex; flex-direction: column; gap: var(--ds-space-1); }
    .dsu__file-top { display: flex; align-items: center; justify-content: space-between; }
    .dsu__file-name {
      flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-medium); color: var(--ds-surface-elevated-on);
    }
    .dsu__file-size { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .dsu__progress {
      height: var(--ds-size-1-5); border-radius: var(--ds-radius-full);
      background: var(--ds-surface-muted); overflow: hidden;
    }
    .dsu__progress-bar {
      height: 100%; border-radius: var(--ds-radius-full);
      background: var(--ds-status-info); transition: width 0.2s ease;
    }
    .dsu__file-status { display: flex; align-items: center; gap: var(--ds-space-1); font-size: var(--ds-text-caption); }
    .dsu__file-status--error { color: var(--ds-status-danger); }
    .dsu__file-status--done { color: var(--ds-status-success); }
    .dsu__remove {
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ds-size-7); height: var(--ds-size-7); border: none; background: transparent;
      color: var(--ds-text-muted); cursor: pointer; border-radius: var(--ds-radius-md);
    }
    .dsu__remove:hover { background: var(--ds-surface-hover); color: var(--ds-status-danger); }
  `,
})
export class DsFormUploadComponent {
  readonly name = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly dropTitle = input('');
  readonly message = input('');
  readonly state = input<DsFormUploadState>('default');
  readonly accept = input('');
  readonly multiple = input(false);
  readonly disabled = input(false);
  readonly maxSizeMb = input<number>(10);
  readonly config = input<DsFormUploadConfig | null>(null);

  readonly upload = output<File>();
  readonly removeFile = output<string>();

  protected readonly files = signal<DsFormUploadFile[]>([]);
  protected readonly dragging = signal(false);

  constructor(private readonly hostEl: ElementRef<HTMLElement>) {}

  protected readonly acceptText = computed(() => {
    const a = this.accept();
    if (!a) return `Up to ${this.maxSizeMb()} MB per file`;
    const ext = a.split(',').map((e) => e.trim()).join(' · ');
    return `${ext} · up to ${this.maxSizeMb()} MB`;
  });

  /** Public helpers exposed for consumers via template reference or injection. */
  protected onDragOver(): void {
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    this.dragging.set(false);
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    if (dropped.length) this._addFiles(dropped);
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    if (selected.length) this._addFiles(selected);
    input.value = '';
  }

  protected openBrowser(): void {
    if (this.disabled()) return;
    const input = this.hostEl.nativeElement.querySelector('input[type="file"]') as HTMLInputElement | null;
    input?.click();
  }

  /** R6: Enter/Space open the browser — the dropzone is a keyboard button. */
  protected onDropzoneKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (this.disabled()) return;
    event.preventDefault();
    this.openBrowser();
  }

  private _addFiles(selected: File[]): void {
    if (this.disabled()) return;
    const list = this.files();
    const next = [...list];
    for (const file of selected) {
      if (this.maxSizeMb() && file.size > this.maxSizeMb() * 1024 * 1024) {
        next.push({
          id: this._fileId(file),
          name: file.name,
          size: file.size,
          status: 'error',
          progress: 0,
          error: `Exceeds ${this.maxSizeMb()} MB`,
        });
        continue;
      }
      next.push({ id: this._fileId(file), name: file.name, size: file.size, status: 'idle', progress: 0 });
    }
    this.files.set(next);
    // Trigger upload: injected callback (await) or emit decoupled.
    for (const file of selected) {
      const cfg = this.config();
      if (cfg?.upload) {
        this._uploadInjected(file);
      } else {
        this.upload.emit(file);
      }
    }
  }

  private async _uploadInjected(file: File): Promise<void> {
    const id = this._fileId(file);
    this._setStatus(id, 'uploading', 0);
    try {
      const cfg = this.config();
      if (!cfg?.upload) return;
      await cfg.upload(file);
      this._setStatus(id, 'done', 100);
    } catch (e) {
      this._setStatus(id, 'error', 0, String(e ?? 'Upload failed'));
    }
  }

  /** Consumer calls after a decoupled upload completes. */
  markDone(id: string, response?: unknown): void {
    this._setStatus(id, 'done', 100, undefined, response);
  }

  /** Consumer calls to report progress for a decoupled upload. */
  updateProgress(id: string, progress: number): void {
    const f = this.files().find((x) => x.id === id);
    if (!f) return;
    const status = progress >= 100 ? 'done' : 'uploading';
    this.files.update((list) => list.map((x) => (x.id === id ? { ...x, progress, status } : x)));
  }

  /** Consumer calls to flag a decoupled upload as failed. */
  markError(id: string, error: string): void {
    this._setStatus(id, 'error', 0, error);
  }

  protected remove(id: string): void {
    this.files.update((list) => list.filter((x) => x.id !== id));
    this.removeFile.emit(id);
  }

  private _setStatus(id: string, status: DsFormUploadStatus, progress: number, error?: string, response?: unknown): void {
    this.files.update((list) => list.map((x) => (x.id === id ? { ...x, status, progress, error: error ?? x.error, response: response ?? x.response } : x)));
  }

  private _fileId(file: File): string {
    return `${file.name}__${file.size}`;
  }

  protected formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  }
}