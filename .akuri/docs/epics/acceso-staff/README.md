---
file: README.md
doc-type: EPIC
level: L3
area: A2
position: 1
title: Acceso del personal
summary: Épica de acceso del personal autorizado — inicio de sesión, guarda de sesión,
  roles y permisos, y auditoría de acceso, documentados como transversales integrales
  que orientan la construcción y la auditoría de la consola analítica.
epic: acceso-staff
project: encuestaintt
corpus-root: .akuri/docs
transversals: login-staff sesion-guard roles-permisos auditoria-acceso
---

# Épica — Acceso del personal (acceso-staff)

Cada transversal cubre todas las capas: descripción (relato de usuario / caso de uso / UX-UI),
reglas, persistencia, capa servidor, lógica de interfaz, capa visual (sketch ADL) y
experiencias visuales, más la trazabilidad documento↔código.

Esta épica modela el acceso del personal del INTT a la consola analítica: inicio de sesión de
staff, guarda de sesión, roles y permisos, y auditoría de acceso. El sistema usa sesión local
propia, federable a futuro.

## Transversales

| Transversal | Archivo |
|---|---|
| Inicio de sesión de staff | transversal-login-staff.md |
| Guarda de sesión | transversal-sesion-guard.md |
| Roles y permisos | transversal-roles-permisos.md |
| Auditoría de acceso | transversal-auditoria-acceso.md |

## Cobertura

Toda funcionalidad de esta épica se documenta en exactamente un transversal (el índice se
mantiene en el campo `transversals` del frontmatter). Las reglas locales del proyecto viven en
`.akuri/rules/rules.yaml` y se componen sobre las normas base del pack (N01…N10).
