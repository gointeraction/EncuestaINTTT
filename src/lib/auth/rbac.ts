import { NextRequest, NextResponse } from "next/server";
import { AuthUser, UserRole, ProblemDetails } from "./types";
import { getAuthUserFromRequest } from "./session";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  analyst: 10,
  creator: 20,
  admin: 30,
};

/**
 * Valida si un rol tiene un nivel de privilegio mayor o igual al rol mínimo requerido.
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

/**
 * Genera una respuesta estándar RFC 7807 Problem Details.
 */
export function createProblemResponse(problem: ProblemDetails): NextResponse {
  return NextResponse.json(problem, {
    status: problem.status,
    headers: {
      "Content-Type": "application/problem+json",
    },
  });
}

/**
 * Guard para validar que el usuario esté autenticado.
 * Retorna el usuario autenticado o una respuesta NextResponse con HTTP 401.
 */
export function requireAuth(
  request: NextRequest
): { user: AuthUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse } {
  const user = getAuthUserFromRequest(request);

  if (!user) {
    return {
      errorResponse: createProblemResponse({
        type: "https://httpstatuses.com/401",
        title: "No Autenticado",
        status: 401,
        detail: "Se requiere un token de sesión o header Authorization Bearer válido.",
      }),
    };
  }

  return { user };
}

/**
 * Guard para validar que el usuario tenga uno de los roles permitidos o alcance el rol mínimo requerido.
 */
export function requireRoles(
  request: NextRequest,
  allowedRoles: UserRole[]
): { user: AuthUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse } {
  const auth = requireAuth(request);
  if (auth.errorResponse) return auth;

  const user = auth.user;
  const isAllowed = allowedRoles.some((role) => user.role === role || user.role === "admin");

  if (!isAllowed) {
    return {
      errorResponse: createProblemResponse({
        type: "https://httpstatuses.com/403",
        title: "Acceso Denegado",
        status: 403,
        detail: `El rol actual '${user.role}' no cuenta con permisos suficientes para este recurso.`,
      }),
    };
  }

  return { user };
}
