/** Usuario de staff autenticado (proyección de sesión). */
export interface StaffSessionUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}
