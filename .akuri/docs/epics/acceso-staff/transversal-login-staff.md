---
file: transversal-login-staff.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 2
title: Inicio de sesión de staff
summary: Acceso del personal autorizado a la consola — credenciales locales, creación
  de la sesión firmada, cierre de sesión y límite de intentos; sesión local federable.
epic: acceso-staff
transversal: login-staff
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: login-staff logout-staff
routes: /auth/staff/login /auth/staff/logout
models: StaffUser StaffSession
---

# Transversal — Inicio de sesión de staff (épica acceso-staff)

## SECTION 01-DESCRIPCION

- **user-story:** Como miembro autorizado del INTT, quiero entrar con mis credenciales locales para acceder a la consola analítica.
- **use-case:** UC-STAFF-01 (inicio de sesión con credenciales), UC-STAFF-02 (cierre de sesión).
- **ux-ui:** pantalla de acceso con correo y clave, estados de carga y de error; al entrar redirige al panel según el rol.

## SECTION 02-REGLAS

- **acceso-staff.login-staff.R01:** el inicio de sesión valida credenciales locales; credenciales erróneas responden 401 sin revelar si el correo existe.
- **acceso-staff.login-staff.R02:** el servidor crea una sesión firmada y la entrega en cookie httpOnly; la sesión tiene vigencia y se rota al renovar.
- **acceso-staff.login-staff.R03:** el cierre de sesión invalida la sesión en el servidor y limpia la cookie.
- **acceso-staff.login-staff.R04:** el acceso admite un máximo de intentos por minuto por origen; al excederse responde 429.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `StaffUser` | esquema `analytics` | identidad del personal: correo, clave cifrada, rol, estado |
| `StaffSession` | esquema `analytics` | sesión firmada persistida y rotada |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/platform/identity` (hexagonal).
- **Rutas:**
  - `POST /auth/staff/login` — valida credenciales y crea la sesión.
  - `POST /auth/staff/logout` — invalida la sesión.
- **Permisos:** el acceso es público con límite de intentos; el resto exige sesión.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/auth/` (pantalla de acceso).
- **Estado:** `anon → autenticando → autenticado | error`.
- **Datos:** el acceso consume el contrato generado (api-sdk); la cookie viaja sola (mismo origen).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/login-staff.adl

Componentes: campo de correo, campo de clave, botón de acceso y banner de error.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: completar credenciales → autenticado → redirección al panel según el rol.
- Estados: carga, credenciales inválidas, exceso de intentos.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| inicio-sesion | `StaffUser`, `StaffSession` | identidad use-cases | `/auth/staff/login` | `modules/auth` |
| cierre-sesion | `StaffSession` | identidad use-cases | `/auth/staff/logout` | `modules/auth` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
