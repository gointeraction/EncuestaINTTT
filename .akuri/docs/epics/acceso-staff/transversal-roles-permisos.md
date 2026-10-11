---
file: transversal-roles-permisos.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 4
title: Roles y permisos
summary: Control de acceso del personal — roles admin/analista/auditor, autorización por
  política y alcance por fila/columna, con enmascaramiento de datos personales por rol.
epic: acceso-staff
transversal: roles-permisos
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: roles-permisos
routes: /auth/staff/me
models: StaffRole StaffUser
---

# Transversal — Roles y permisos (épica acceso-staff)

## SECTION 01-DESCRIPCION

- **user-story:** Como administrador del INTT, quiero asignar roles a cada miembro para que vea y exporte solo lo que le corresponde.
- **use-case:** UC-STAFF-04 (asignación y aplicación de roles y permisos).
- **ux-ui:** el menú y las acciones se ajustan al rol; la gestión de roles queda reservada a administradores.

## SECTION 02-REGLAS

- **acceso-staff.roles-permisos.R01:** existen tres roles — `admin`, `analista` y `auditor` — con permisos distintos sobre lectura, exportación y gestión.
- **acceso-staff.roles-permisos.R02:** la autorización se evalúa por política en el servidor; el alcance por fila y columna se aplica antes de responder.
- **acceso-staff.roles-permisos.R03:** el enmascaramiento de datos personales se decide por rol en el servidor; el cliente nunca recibe lo no autorizado.
- **acceso-staff.roles-permisos.R04:** solo `admin` gestiona roles y asignaciones.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `StaffRole` | esquema `analytics` | definición de roles y permisos asociados |
| `StaffUser` | esquema `analytics` | miembro del personal con su rol asignado |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/platform/identity` (hexagonal), guardas y políticas.
- **Rutas:**
  - `GET /auth/staff/me` — devuelve el rol y los permisos del usuario actual.
- **Permisos:** la lectura exige sesión; la gestión de roles exige `admin`.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/access/` (consulta y gestión según rol).
- **Estado:** permisos cargados tras el acceso; el menú y los botones se derivan del rol.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/roles-permisos.adl

Componentes: tabla de miembros, selector de rol y acciones por permiso.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: administrador abre la gestión → asigna rol → el cambio aplica al recargar.
- Estados: sin permiso (acción oculta), carga y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| roles-permisos | `StaffRole`, `StaffUser` | identidad guardas/políticas | `/auth/staff/me` | `modules/access` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
