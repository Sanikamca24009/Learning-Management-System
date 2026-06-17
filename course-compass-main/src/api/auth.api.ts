import API from "./client";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "user" | "instructor" | "admin";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    bio?: string;
  };
  pending?: boolean;
  message?: string;
}

export const authApi = {
  register: (data: RegisterData) =>
    API.post<AuthResponse>("/auth/register", data),

  login: (data: LoginData) =>
    API.post<AuthResponse>("/auth/login", data),

  logout: () =>
    API.post("/auth/logout"),

  getMe: () =>
    API.get("/auth/me"),
};
