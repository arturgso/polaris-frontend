export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type?: string;
  expiresIn?: number;
}

export interface NewUserDTO {
  username: string;
  password: string;
}

export interface UserDTO {
  id: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  token: string;
  type?: string;
  expiresAt?: number;
  authenticatedAt: string;
}
