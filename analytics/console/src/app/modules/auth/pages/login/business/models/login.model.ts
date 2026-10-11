export interface StaffUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: StaffUser | null;
}
