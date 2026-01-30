const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

class AdminApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin_token");
  }

  setToken(token: string, userId: string, userName: string, role: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_id", userId);
    localStorage.setItem("admin_name", userName);
    localStorage.setItem("admin_role", role);
    // Cookie para middleware
    document.cookie = `admin_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }

  clearAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_role");
    document.cookie = "admin_token=; path=/; max-age=0";
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAdminName(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("admin_name") || "Admin";
  }

  getAdminRole(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("admin_role") || "admin";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = { message: "Erro ao processar resposta" };
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      throw { message: data?.message || `Erro ${response.status}`, status: response.status };
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{
      user: { id: string; name: string; email: string; role: string };
      token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!data.user.role || !["admin", "super_admin"].includes(data.user.role)) {
      throw { message: "Acesso restrito a administradores", status: 403 };
    }

    this.setToken(data.token, data.user.id, data.user.name || "Admin", data.user.role);
    return data;
  }

  // Dashboard
  async getDashboard() {
    return this.request<{
      totalUsers: number;
      activePasses: number;
      estimatedRevenue: number;
      vouchers: { total: number; available: number; used: number; expired: number };
      recentValidations: any[];
    }>("/admin/dashboard");
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    return this.request<{ data: any[]; total: number; page: number; totalPages: number }>(
      `/admin/users?${query}`
    );
  }

  async getUserDetail(id: string) {
    return this.request<any>(`/admin/users/${id}`);
  }

  async suspendUser(id: string) {
    return this.request<{ message: string }>(`/admin/users/${id}/suspend`, { method: "POST" });
  }

  async activateUser(id: string) {
    return this.request<{ message: string }>(`/admin/users/${id}/activate`, { method: "POST" });
  }

  // Restaurants
  async getRestaurants(params?: { page?: number; limit?: number; search?: string; active?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.active) query.set("active", params.active);
    return this.request<{ data: any[]; total: number; page: number; totalPages: number }>(
      `/admin/restaurants?${query}`
    );
  }

  async createRestaurant(data: { name: string; city: string; discount_label: string; image_url?: string; category?: string; description?: string }) {
    return this.request<any>("/admin/restaurants", { method: "POST", body: JSON.stringify(data) });
  }

  async updateRestaurant(id: number, data: any) {
    return this.request<any>(`/admin/restaurants/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async toggleRestaurant(id: number) {
    return this.request<any>(`/admin/restaurants/${id}/toggle`, { method: "PATCH" });
  }

  // Vouchers
  async getVouchers(params?: { page?: number; limit?: number; status?: string; search?: string; user_id?: string; restaurant_id?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.user_id) query.set("user_id", params.user_id);
    if (params?.restaurant_id) query.set("restaurant_id", params.restaurant_id);
    return this.request<{ data: any[]; total: number; page: number; totalPages: number }>(
      `/admin/vouchers?${query}`
    );
  }

  async manualValidateVoucher(id: string) {
    return this.request<any>(`/admin/vouchers/${id}/validate`, { method: "POST" });
  }

  // Audit Logs
  async getAuditLogs(params?: { page?: number; limit?: number; action?: string; admin_id?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.action) query.set("action", params.action);
    if (params?.admin_id) query.set("admin_id", params.admin_id);
    return this.request<{ data: any[]; total: number; page: number; totalPages: number }>(
      `/admin/audit-logs?${query}`
    );
  }
}

export const adminApi = new AdminApiClient(BACKEND_URL);
