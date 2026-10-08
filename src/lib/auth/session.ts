import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyAuthToken, signAuthToken } from "./jwt";
import { AuthUser, UserRole } from "./types";
import { verifyAdminToken } from "../admin-auth";

export const AUTH_COOKIE_NAME = "sdd_auth_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

/**
 * Extrae el token de autenticación desde el header Authorization (Bearer) o desde la cookie segura.
 */
export function extractToken(request?: NextRequest, cookieValue?: string | null): string | null {
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
  }

  if (cookieValue) {
    return cookieValue;
  }

  return null;
}

/**
 * Obtiene el usuario autenticado a partir de un NextRequest.
 */
export function getAuthUserFromRequest(request: NextRequest): AuthUser | null {
  // 1. Probar token JWT de SDD (cookie o header Authorization)
  const cookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const token = extractToken(request, cookieValue);
  if (token) {
    const payload = verifyAuthToken(token);
    if (payload) {
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }
  }

  // 2. Probar cookie de administrador unificado intt_admin_session
  const adminCookie = request.cookies.get("intt_admin_session")?.value;
  if (adminCookie && verifyAdminToken(adminCookie)) {
    return {
      id: "admin-master",
      email: "admin@intt.gob.ve",
      role: "admin",
    };
  }

  return null;
}

/**
 * Obtiene el usuario autenticado a partir de las cookies de Next.js (Server Components / Server Actions).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const payload = verifyAuthToken(token);
      if (payload) {
        return {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };
      }
    }

    const adminCookie = cookieStore.get("intt_admin_session")?.value;
    if (adminCookie && verifyAdminToken(adminCookie)) {
      return {
        id: "admin-master",
        email: "admin@intt.gob.ve",
        role: "admin",
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Establece la cookie de sesión para el usuario.
 */
export async function createAuthSessionCookie(user: { id: string; email: string; role: UserRole }): Promise<string> {
  const token = signAuthToken(user, COOKIE_MAX_AGE);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return token;
}

/**
 * Elimina la cookie de sesión de autenticación.
 */
export async function destroyAuthSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
