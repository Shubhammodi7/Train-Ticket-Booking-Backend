export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "USER" | "ADMIN";
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  passwordHash: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  mobile: string;
  passwordHash: string | null;
}
