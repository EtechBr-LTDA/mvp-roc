/**
 * Cliente API para comunicação com o backend NestJS
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export interface ApiError {
  message: string;
  status?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Adicionar user-id do token se disponível
    const userId = this.getUserId();
    if (userId) {
      headers["x-user-id"] = userId.toString();
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || data.error || "Erro na requisição",
          status: response.status,
        } as ApiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw error;
      }
      throw {
        message: "Erro de conexão com o servidor",
        status: 0,
      } as ApiError;
    }
  }

  // Gerenciamento de Token e User ID
  setToken(token: string, userId?: number) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      if (userId) {
        localStorage.setItem("user_id", userId.toString());
      }
    }
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  getUserId(): number | null {
    if (typeof window === "undefined") return null;
    const userId = localStorage.getItem("user_id");
    return userId ? parseInt(userId, 10) : null;
  }

  clearAuth() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{
      user: { id: number; name: string; cpf: string; email: string };
      token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.token, response.user.id);
    return response;
  }

  async register(data: {
    name: string;
    cpf: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) {
    const response = await this.request<{
      user: { id: number; name: string; cpf: string; email: string };
      token: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    this.setToken(response.token, response.user.id);
    return response;
  }

  // Vouchers endpoints
  async getVouchers() {
    return this.request<any[]>("/vouchers", {
      method: "GET",
    });
  }

  async getVoucherById(id: number) {
    return this.request<any>(`/vouchers/${id}`, {
      method: "GET",
    });
  }

  async useVoucher(id: number) {
    return this.request<any>(`/vouchers/${id}/use`, {
      method: "POST",
    });
  }

  // Validation endpoints
  async validateVoucher(cpf: string, code: string) {
    return this.request<{
      message: string;
      voucher: { id: number; restaurantName: string; city: string };
      customer: { id: number; name: string; cpf: string };
    }>("/validation", {
      method: "POST",
      body: JSON.stringify({ cpf, code }),
    });
  }
}

export const apiClient = new ApiClient(BACKEND_URL);



