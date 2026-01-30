import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../../config/supabase.config";

export interface DashboardStats {
  totalUsers: number;
  activePasses: number;
  estimatedRevenue: number;
  vouchers: {
    total: number;
    available: number;
    used: number;
    expired: number;
  };
  recentValidations: any[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable()
export class AdminService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient
  ) {}

  // ==================== AUDIT LOG ====================

  async logAction(
    adminId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: any
  ): Promise<void> {
    // Fire-and-forget: nao bloqueia a acao principal
    this.supabase
      .from("admin_audit_logs")
      .insert({ admin_id: adminId, action, target_type: targetType, target_id: targetId, details })
      .then(({ error }) => {
        if (error) console.error("Erro ao registrar audit log:", error.message);
      });
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      { count: totalUsers },
      { count: activePasses },
      { count: totalVouchers },
      { count: usedVouchers },
      { count: availableVouchers },
    ] = await Promise.all([
      this.supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
      this.supabase.from("passes").select("*", { count: "exact", head: true }).eq("status", "active"),
      this.supabase.from("vouchers").select("*", { count: "exact", head: true }),
      this.supabase.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "used"),
      this.supabase.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "available"),
    ]);

    // Ultimas 10 validacoes
    const { data: recentValidations } = await this.supabase
      .from("vouchers")
      .select("id, code, used_at, profile:profiles(full_name, email), restaurant:restaurants(name)")
      .eq("status", "used")
      .not("used_at", "is", null)
      .order("used_at", { ascending: false })
      .limit(10);

    return {
      totalUsers: totalUsers || 0,
      activePasses: activePasses || 0,
      estimatedRevenue: (activePasses || 0) * 99.99,
      vouchers: {
        total: totalVouchers || 0,
        used: usedVouchers || 0,
        available: availableVouchers || 0,
        expired: (totalVouchers || 0) - (usedVouchers || 0) - (availableVouchers || 0),
      },
      recentValidations: (recentValidations || []).map((v: any) => ({
        id: v.id,
        code: v.code,
        usedAt: v.used_at,
        userName: Array.isArray(v.profile) ? v.profile[0]?.full_name : v.profile?.full_name,
        userEmail: Array.isArray(v.profile) ? v.profile[0]?.email : v.profile?.email,
        restaurantName: Array.isArray(v.restaurant) ? v.restaurant[0]?.name : v.restaurant?.name,
      })),
    };
  }

  // ==================== USERS ====================

  async listUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResult<any>> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("profiles")
      .select("id, full_name, email, cpf, phone, city, role, suspended_at, created_at", { count: "exact" })
      .eq("role", "user");

    // Filtro de busca
    if (options.search) {
      query = query.or(
        `full_name.ilike.%${options.search}%,email.ilike.%${options.search}%,cpf.ilike.%${options.search}%`
      );
    }

    // Filtro de status
    if (options.status === "active") {
      query = query.is("suspended_at", null);
    } else if (options.status === "suspended") {
      query = query.not("suspended_at", "is", null);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Erro ao listar usuarios: ${error.message}`);

    return {
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async getUserDetail(userId: string): Promise<any> {
    const { data: user, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) throw new NotFoundException("Usuario nao encontrado");

    // Buscar vouchers do usuario
    const { data: vouchers } = await this.supabase
      .from("vouchers")
      .select("id, code, status, used_at, created_at, restaurant:restaurants(name, city, discount_label)")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    // Buscar pass do usuario
    const { data: pass } = await this.supabase
      .from("passes")
      .select("*")
      .eq("profile_id", userId)
      .eq("status", "active")
      .single();

    return {
      ...user,
      password_hash: undefined,
      vouchers: (vouchers || []).map((v: any) => ({
        ...v,
        restaurant: Array.isArray(v.restaurant) ? v.restaurant[0] : v.restaurant,
      })),
      pass: pass || null,
    };
  }

  async suspendUser(userId: string, adminId: string): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({ suspended_at: new Date().toISOString() })
      .eq("id", userId)
      .eq("role", "user");

    if (error) throw new Error(`Erro ao suspender usuario: ${error.message}`);

    await this.logAction(adminId, "user.suspend", "user", userId);
  }

  async activateUser(userId: string, adminId: string): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({ suspended_at: null })
      .eq("id", userId);

    if (error) throw new Error(`Erro ao ativar usuario: ${error.message}`);

    await this.logAction(adminId, "user.activate", "user", userId);
  }

  // ==================== RESTAURANTS ====================

  async listRestaurants(options: {
    page?: number;
    limit?: number;
    search?: string;
    active?: string;
  }): Promise<PaginatedResult<any>> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("restaurants")
      .select("*", { count: "exact" });

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,city.ilike.%${options.search}%`);
    }

    if (options.active === "true") {
      query = query.eq("active", true);
    } else if (options.active === "false") {
      query = query.eq("active", false);
    }

    const { data, error, count } = await query
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Erro ao listar restaurantes: ${error.message}`);

    return {
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async createRestaurant(input: {
    name: string;
    city: string;
    discount_label: string;
    image_url?: string;
    category?: string;
    description?: string;
  }, adminId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from("restaurants")
      .insert({
        name: input.name,
        city: input.city,
        discount_label: input.discount_label,
        image_url: input.image_url || null,
        category: input.category || null,
        description: input.description || null,
        active: true,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar restaurante: ${error.message}`);

    await this.logAction(adminId, "restaurant.create", "restaurant", data.id.toString(), { name: input.name });

    return data;
  }

  async updateRestaurant(id: number, input: {
    name?: string;
    city?: string;
    discount_label?: string;
    image_url?: string;
    category?: string;
    description?: string;
    active?: boolean;
  }, adminId: string): Promise<any> {
    const updateData: Record<string, any> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.discount_label !== undefined) updateData.discount_label = input.discount_label;
    if (input.image_url !== undefined) updateData.image_url = input.image_url;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.active !== undefined) updateData.active = input.active;

    const { data, error } = await this.supabase
      .from("restaurants")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar restaurante: ${error.message}`);

    await this.logAction(adminId, "restaurant.update", "restaurant", id.toString(), updateData);

    return data;
  }

  async toggleRestaurant(id: number, adminId: string): Promise<any> {
    // Buscar estado atual
    const { data: current, error: fetchError } = await this.supabase
      .from("restaurants")
      .select("active")
      .eq("id", id)
      .single();

    if (fetchError || !current) throw new NotFoundException("Restaurante nao encontrado");

    const newActive = !current.active;

    const { data, error } = await this.supabase
      .from("restaurants")
      .update({ active: newActive })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao alternar restaurante: ${error.message}`);

    await this.logAction(adminId, newActive ? "restaurant.activate" : "restaurant.deactivate", "restaurant", id.toString());

    return data;
  }

  // ==================== VOUCHERS ====================

  async listVouchers(options: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
    restaurant_id?: string;
    search?: string;
  }): Promise<PaginatedResult<any>> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("vouchers")
      .select(
        "id, code, status, used_at, created_at, profile:profiles(full_name, email), restaurant:restaurants(name, city)",
        { count: "exact" }
      );

    if (options.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }

    if (options.user_id) {
      query = query.eq("profile_id", options.user_id);
    }

    if (options.restaurant_id) {
      query = query.eq("restaurant_id", parseInt(options.restaurant_id));
    }

    if (options.search) {
      query = query.ilike("code", `%${options.search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Erro ao listar vouchers: ${error.message}`);

    return {
      data: (data || []).map((v: any) => ({
        ...v,
        profile: Array.isArray(v.profile) ? v.profile[0] : v.profile,
        restaurant: Array.isArray(v.restaurant) ? v.restaurant[0] : v.restaurant,
      })),
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async manualValidateVoucher(voucherId: string, adminId: string): Promise<any> {
    const { data: voucher, error: fetchError } = await this.supabase
      .from("vouchers")
      .select("*, restaurant:restaurants(name)")
      .eq("id", voucherId)
      .single();

    if (fetchError || !voucher) throw new NotFoundException("Voucher nao encontrado");

    if (voucher.status === "used") {
      throw new BadRequestException("Voucher ja utilizado");
    }

    const { data, error } = await this.supabase
      .from("vouchers")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", voucherId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao validar voucher: ${error.message}`);

    await this.logAction(adminId, "voucher.manual_validate", "voucher", voucherId, { code: voucher.code });

    return data;
  }

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    action?: string;
    admin_id?: string;
  }): Promise<PaginatedResult<any>> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("admin_audit_logs")
      .select("*, admin:profiles!admin_id(full_name, email)", { count: "exact" });

    if (options.action) {
      query = query.ilike("action", `%${options.action}%`);
    }

    if (options.admin_id) {
      query = query.eq("admin_id", options.admin_id);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Erro ao listar audit logs: ${error.message}`);

    return {
      data: (data || []).map((log: any) => ({
        ...log,
        admin: Array.isArray(log.admin) ? log.admin[0] : log.admin,
      })),
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }
}
