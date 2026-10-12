import { Pipe, PipeTransform } from '@angular/core';

/**
 * `num` — formatea NÚMEROS con separador de miles (es-VE: `1.000.000`).
 * No toca strings ni nulos (los deja igual) para poder usarlo en cualquier celda.
 */
@Pipe({ name: 'num', standalone: true, pure: true })
export class NumPipe implements PipeTransform {
  transform(value: unknown): string {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toLocaleString('es-VE');
    }
    return value === null || value === undefined ? '' : String(value);
  }
}
