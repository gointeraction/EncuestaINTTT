import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * `@Public()` — marca un controlador o ruta como de acceso abierto (sin sesión de
 * personal). Lo consume el guard de sesión (F2). Mantiene explícito qué es público.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
