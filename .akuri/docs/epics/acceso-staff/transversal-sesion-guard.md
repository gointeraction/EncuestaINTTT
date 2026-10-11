---
file: transversal-sesion-guard.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 3
title: Guarda de sesión
summary: Verificación y renovación de la sesión del personal en la consola — la guarda
  protege las rutas y renueva la sesión antes de expirar; al fallar redirige al acceso.
epic: acceso-staff
transversal: sesion-guard
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: sesion-guard
routes: /auth/staff/session
models: StaffSession
---

# Transversal — Guarda de sesión (épica acceso-staff)

## SECTION 01-DESCRIPCION

- **user-story:** Como usuario autenticado, quiero que mi sesión se verifique y se renueve de forma transparente para no perder el trabajo en curso.
- **use-case:** UC-STAFF-03 (verificación y renovación de la sesión).
- **ux-ui:** pantalla de verificación breve antes de entrar; si la sesión expiró, se redirige a la pantalla de acceso.

## SECTION 02-REGLAS

- **acceso-staff.sesion-guard.R01:** toda ruta protegida declara una guarda que exige sesión vigente antes de renderizar.
- **acceso-staff.sesion-guard.R02:** si la sesión está por expirar, el servidor la renueva y reemite la cookie sin interrumpir al usuario.
- **acceso-staff.sesion-guard.R03:** si la sesión no es válida, se redirige a la pantalla de acceso conservando el destino.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `StaffSession` | esquema `analytics` | vigencia, renovación y revocación de la sesión |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/platform/identity` (hexagonal).
- **Rutas:**
  - `GET /auth/staff/session` — valida la sesión vigente y la renueva si hace falta.

## SECTION 05-FRONTEND-LOGICA

- **Guarda:** `analytics/console/src/app/core/` (guarda de sesión en el enrutador).
- **Estado:** `verificando → autenticado | expirado`.
- **Datos:** la guarda consulta el contrato generado (api-sdk) antes de permitir la ruta.

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/sesion-guard.adl

Componentes: mensaje de verificación y spinner.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: abrir la consola → verificación → panel.
- Estados: verificación breve, sesión expirada (redirección al acceso), fallo de red (reintento).
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| sesion-guard | `StaffSession` | identidad use-cases | `/auth/staff/session` | `core` (guarda) |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
