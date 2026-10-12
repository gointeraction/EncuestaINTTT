export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export interface PasswordResetRow {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}
