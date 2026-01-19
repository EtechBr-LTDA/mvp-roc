/**
 * Cliente API para comunicação com o backend NestJS
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export interface ApiError {
  message: string;
  status?: number;
}

export interface User {
  id: string;
  name: string | null;
  cpf: string | null;
  email: string | null;
}

export interface Restaurant {
  id: number;
  name: string;
  city: string;
  discountLabel: string;
  imageUrl: string | null;
  category: string | null;
}

export interface Voucher {
  id: string;
  code: string;
  status: "available" | "used" | "expired";
  used: boolean;
  usedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  restaurantName: string;
  city: string;
  discountLabel: string;
  imageUrl: string | null;
  category: string | null;
  restaurant: Restaurant;
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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge existing headers if any
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      let data: any;
      const contentType = response.headers.get("content-type");

      try {
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = text ? { message: text, error: text } : { message: "Erro na requisição" };
        }
      } catch (parseError) {
        data = { message: "Erro ao processar resposta do servidor", error: "Parse error" };
      }

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          data?.error ||
          data?.toString() ||
          `Erro ${response.status}: ${response.statusText}`;

        throw {
          message: errorMessage,
          status: response.status,
        } as ApiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw error;
      }

      const errorMessage = error instanceof Error
        ? error.message
        : "Erro de conexão com o servidor";

      throw {
        message: errorMessage,
        status: 0,
      } as ApiError;
    }
  }

  // Gerenciamento de Token e User ID
  setToken(token: string, userId?: string, userName?: string, userEmail?: string, rememberMe: boolean = false) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      if (userId) {
        localStorage.setItem("user_id", userId);
      }
      if (userName) {
        localStorage.setItem("user_name", userName);
      }
      if (userEmail) {
        localStorage.setItem("user_email", userEmail);
      }

      // Salvar data de expiração se "lembrar de mim" estiver marcado
      if (rememberMe) {
        // 30 dias em milissegundos
        const expirationDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem("auth_expiration", expirationDate.toString());
        localStorage.setItem("remember_me", "true");
      } else {
        // Sessão expira quando fechar o navegador (não salva expiração)
        localStorage.removeItem("auth_expiration");
        localStorage.removeItem("remember_me");
      }
    }
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    // Verificar se a sessão expirou
    const expiration = localStorage.getItem("auth_expiration");
    const rememberMe = localStorage.getItem("remember_me");

    // Se "lembrar de mim" estava marcado, verificar expiração de 30 dias
    if (rememberMe === "true" && expiration) {
      const expirationDate = parseInt(expiration, 10);
      if (Date.now() > expirationDate) {
        // Token expirou, limpar auth
        this.clearAuth();
        return null;
      }
    }

    return token;
  }

  getUserId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("user_id");
  }

  isRemembered(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("remember_me") === "true";
  }

  clearAuth() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("auth_expiration");
      localStorage.removeItem("remember_me");
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Auth endpoints
  async login(email: string, password: string, rememberMe: boolean = false) {
    const response = await this.request<{
      user: User;
      token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    this.setToken(
      response.token,
      response.user.id,
      response.user.name || undefined,
      response.user.email || undefined,
      rememberMe
    );
    return response;
  }

  async register(data: {
    name: string;
    cpf: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    address?: {
      cep: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
    };
  }) {
    const response = await this.request<{
      user: User;
      token: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    this.setToken(response.token, response.user.id, response.user.name || undefined, response.user.email || undefined);
    return response;
  }

  // Profile endpoints
  async getProfile() {
    return this.request<{
      id: string;
      full_name: string;
      cpf: string;
      email: string;
      phone?: string;
      address?: {
        cep: string;
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
      };
      created_at: string;
    }>("/auth/profile", {
      method: "GET",
    });
  }

  async updateProfile(data: {
    full_name?: string;
    phone?: string;
    address?: {
      cep: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
    };
  }) {
    const response = await this.request<{
      id: string;
      full_name: string;
      email: string;
    }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    // Atualizar nome no localStorage se alterado
    if (data.full_name && typeof window !== "undefined") {
      localStorage.setItem("user_name", data.full_name);
    }

    return response;
  }

  // Vouchers endpoints
  async getVouchers(): Promise<Voucher[]> {
    return this.request<Voucher[]>("/vouchers", {
      method: "GET",
    });
  }

  async getVoucherById(id: string): Promise<Voucher> {
    return this.request<Voucher>(`/vouchers/${id}`, {
      method: "GET",
    });
  }

  async useVoucher(id: string): Promise<Voucher> {
    return this.request<Voucher>(`/vouchers/${id}/use`, {
      method: "POST",
    });
  }

  // Validation endpoints
  async validateVoucher(code: string, cpf?: string) {
    return this.request<{
      valid?: boolean;
      message: string;
      voucher: {
        id: string;
        code: string;
        restaurantName?: string;
        city?: string;
        discountLabel?: string;
        restaurant?: {
          name: string;
          city: string;
          offer: string;
        };
      };
      customer?: {
        id?: string;
        name: string | null;
        cpf: string | null;
      } | null;
    }>("/validation", {
      method: "POST",
      body: JSON.stringify(cpf ? { cpf, code } : { code }),
    });
  }
}

export const apiClient = new ApiClient(BACKEND_URL);
