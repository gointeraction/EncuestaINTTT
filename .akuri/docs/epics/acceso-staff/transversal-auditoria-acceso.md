---
file: transversal-auditoria-acceso.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 5
title: Auditoría de acceso
summary: Registro inmutable de las lecturas sensibles del personal — quién consultó
  qué recurso y cuándo; consultable solo por admin y auditor.
epic: acceso-staff
transversal: auditoria-acceso
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: auditoria-acceso
routes: /audit/access
models: AccessAudit
---

# Transversal — Auditoría de acceso (épica acceso-staff)

## SECTION 01-DESCRIPCION

- **user-story:** Como auditor del INTT, quiero revisar quién consultó información sensible para verificar el uso legítimo de los datos.
- **use-case:** UC-STAFF-05 (registro y consulta de la auditoría de acceso).
- **ux-ui:** listado de eventos con actor, recurso y momento; filtros por fecha y por actor.

## SECTION 02-REGLAS

- **acceso-staff.auditoria-acceso.R01:** toda lectura sensible del personal registra un evento con actor, recurso accedido y momento.
- **acceso-staff.auditoria-acceso.R02:** los eventos son inmutables; no se editan ni se borran.
- **acceso-staff.auditoria-acceso.R03:** la consulta de la auditoría queda reservada a `admin` y `auditor`.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `AccessAudit` | esquema `analytics` | evento inmutable: actor, recurso, acción, momento |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/platform/access-audit` (hexagonal).
- **Rutas:**
  - `GET /audit/access` — lista los eventos de auditoría (paginado).
- **Permisos:** exige sesión; la consulta queda reservada a `admin` y `auditor`.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/access/` (vista de auditoría).
- **Estado:** lista paginada con filtros de fecha y actor.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/auditoria-acceso.adl

Componentes: filtros, tabla de eventos y paginación.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: abrir la auditoría → filtrar por fecha → revisar eventos.
- Estados: vacío, carga y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| auditoria-acceso | `AccessAudit` | access-audit use-cases | `/audit/access` | `modules/access` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
