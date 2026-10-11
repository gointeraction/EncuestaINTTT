import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService — cliente del esquema `analytics` (rol del back-office).
 * La conexión es perezosa; la lectura de `public` se hace con SELECT vía
 * `$queryRaw` (el rol solo tiene SELECT sobre public).
 */
@Injectable()
export class PrismaService extends PrismaClient {}
