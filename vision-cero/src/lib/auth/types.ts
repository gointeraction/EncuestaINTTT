export type UserRole = "admin" | "creator" | "analyst";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

export interface AuthTokenPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
