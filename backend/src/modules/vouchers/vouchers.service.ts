import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../../config/supabase.config";

export interface Voucher {
  id: string;
  code: string;
  profile_id: string;
  user_id: string | null;
  pass_id: string;
  restaurant_id: number;
  status: "available" | "used" | "expired";
  used_at: string | null;
  created_at: string;
  expires_at: string | null;
  restaurant?: {
    id: number;
    name: string;
    city: string;
    discount_label: string;
    image_url: string | null;
    category: string | null;
  };
}

export interface VoucherWithRestaurant extends Voucher {
  restaurant: {
    id: number;
    name: string;
    city: string;
    discount_label: string;
    image_url: string | null;
    category: string | null;
  };
}

@Injectable()
export class VouchersService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient
  ) {}

  private generateVoucherCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "ROC-";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Gerar código único verificando no banco
  private async generateUniqueVoucherCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = this.generateVoucherCode();

      // Verificar se código já existe
      const { data: existing } = await this.supabase
        .from("vouchers")
        .select("id")
        .eq("code", code)
        .single();

      if (!existing) {
        return code; // Código único encontrado
      }

      attempts++;
    }

    // Fallback: adicionar timestamp para garantir unicidade
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    return `ROC-${timestamp}${Math.random().toString(36).substring(2, 3).toUpperCase()}`;
  }

  async generateVouchersForUser(profileId: string): Promise<Voucher[]> {
    // Verificar se já existe pass para este profile
    const { data: existingPass } = await this.supabase
      .from("passes")
      .select("id")
      .eq("profile_id", profileId)
      .eq("status", "active")
      .single();

    let passId: string;

    // Se não existe pass, criar um
    if (!existingPass) {
      const { data: newPass, error: passError } = await this.supabase
        .from("passes")
        .insert({
          profile_id: profileId,
          status: "active",
          valid_from: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (passError || !newPass) {
        throw new Error(`Erro ao criar passaporte: ${passError?.message || "Pass não criado"}`);
      }

      passId = newPass.id;
    } else {
      passId = existingPass.id;
    }

    // Verificar TODOS os vouchers do usuário (por profile_id, não apenas pass_id)
    // Isso evita duplicação mesmo se houver múltiplos passes
    const { data: existingVouchers } = await this.supabase
      .from("vouchers")
      .select("*, restaurant:restaurants(*)")
      .eq("profile_id", profileId);

    // Buscar restaurantes ativos
    const { data: restaurants, error: restError } = await this.supabase
      .from("restaurants")
      .select("id")
      .eq("active", true)
      .limit(25);

    if (restError || !restaurants || restaurants.length === 0) {
      // Retornar lista vazia se não há restaurantes
      return existingVouchers || [];
    }

    // VALIDAÇÃO: Garantir apenas um voucher por restaurante por usuário
    // Buscar restaurantes que já têm voucher para este usuário (verificando por profile_id)
    const existingRestaurantIds = new Set(
      existingVouchers?.map((v) => v.restaurant_id) || []
    );

    // Filtrar restaurantes que ainda não têm voucher para este usuário
    const restaurantsToCreate = restaurants.filter(
      (r) => !existingRestaurantIds.has(r.id)
    );

    // Se todos os restaurantes já têm voucher, retornar os existentes
    if (restaurantsToCreate.length === 0) {
      return existingVouchers || [];
    }

    // Gerar vouchers apenas para restaurantes que não têm voucher
    // Usar códigos únicos para evitar colisões
    const vouchersToInsert = await Promise.all(
      restaurantsToCreate.map(async (restaurant) => ({
        code: await this.generateUniqueVoucherCode(),
        profile_id: profileId,
        pass_id: passId,
        restaurant_id: restaurant.id,
        status: "available" as const,
      }))
    );

    const { data: createdVouchers, error: voucherError } = await this.supabase
      .from("vouchers")
      .insert(vouchersToInsert)
      .select("*, restaurant:restaurants(*)");

    if (voucherError) {
      throw new Error(`Erro ao gerar vouchers: ${voucherError.message}`);
    }

    // Retornar todos os vouchers (existentes + novos)
    return [...(existingVouchers || []), ...(createdVouchers || [])];
  }

  async listForUser(
    profileId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ vouchers: VoucherWithRestaurant[]; total: number; page: number; totalPages: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;

    // Buscar vouchers com contagem em uma única query (mais eficiente)
    const { data: vouchers, error, count: total } = await this.supabase
      .from("vouchers")
      .select("id, code, profile_id, user_id, pass_id, restaurant_id, status, used_at, created_at, expires_at, restaurant:restaurants(id, name, city, discount_label, image_url, category)", { count: "exact" })
      .eq("profile_id", profileId)
      .order("status", { ascending: true }) // available primeiro, depois used
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar vouchers: ${error.message}`);
    }

    // Se não há vouchers, gerar novos
    if (!total || total === 0) {
      const newVouchers = await this.generateVouchersForUser(profileId);
      return {
        vouchers: newVouchers as VoucherWithRestaurant[],
        total: newVouchers.length,
        page: 1,
        totalPages: 1,
      };
    }

    // Normalizar restaurant de array para objeto (Supabase retorna array em joins específicos)
    const normalizedVouchers = (vouchers || []).map((v: any) => ({
      ...v,
      restaurant: Array.isArray(v.restaurant) ? v.restaurant[0] : v.restaurant,
    }));

    return {
      vouchers: normalizedVouchers as VoucherWithRestaurant[],
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / limit),
    };
  }

  async findForUser(profileId: string, voucherId: string): Promise<VoucherWithRestaurant> {
    const { data: voucher, error } = await this.supabase
      .from("vouchers")
      .select("*, restaurant:restaurants(*)")
      .eq("id", voucherId)
      .eq("profile_id", profileId)
      .single();

    if (error || !voucher) {
      throw new NotFoundException("Voucher não encontrado");
    }

    return voucher as VoucherWithRestaurant;
  }

  async findById(voucherId: string): Promise<VoucherWithRestaurant | null> {
    const { data: voucher, error } = await this.supabase
      .from("vouchers")
      .select("*, restaurant:restaurants(*)")
      .eq("id", voucherId)
      .single();

    if (error || !voucher) {
      return null;
    }

    return voucher as VoucherWithRestaurant;
  }

  async findByCode(code: string): Promise<(VoucherWithRestaurant & { profile?: { full_name: string; cpf: string } }) | null> {
    // Normalizar código para uppercase
    const normalizedCode = code.toUpperCase().trim();

    // Buscar todos os vouchers com este código para detectar duplicatas
    const { data: vouchers, error } = await this.supabase
      .from("vouchers")
      .select("*, restaurant:restaurants(*), profile:profiles(full_name, cpf)")
      .eq("code", normalizedCode);

    if (error || !vouchers || vouchers.length === 0) {
      return null;
    }

    // Se houver mais de um voucher com o mesmo código, é um problema
    if (vouchers.length > 1) {
      console.error(`[ALERTA] Código duplicado encontrado: ${normalizedCode}. Total: ${vouchers.length} vouchers.`);
      // Retornar o primeiro que não foi usado, ou o primeiro disponível
      const availableVoucher = vouchers.find(v => v.status === "available");
      if (availableVoucher) {
        return availableVoucher as VoucherWithRestaurant & { profile?: { full_name: string; cpf: string } };
      }
    }

    return vouchers[0] as VoucherWithRestaurant & { profile?: { full_name: string; cpf: string } };
  }

  async useVoucher(profileId: string, voucherId: string): Promise<VoucherWithRestaurant> {
    const voucher = await this.findForUser(profileId, voucherId);

    if (voucher.status === "used") {
      throw new BadRequestException("Voucher já utilizado");
    }

    if (voucher.status === "expired") {
      throw new BadRequestException("Voucher expirado");
    }

    const { data: updatedVoucher, error } = await this.supabase
      .from("vouchers")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
      })
      .eq("id", voucherId)
      .select("*, restaurant:restaurants(*)")
      .single();

    if (error) {
      throw new Error(`Erro ao marcar voucher como usado: ${error.message}`);
    }

    return updatedVoucher as VoucherWithRestaurant;
  }

  async useVoucherById(voucherId: string): Promise<VoucherWithRestaurant> {
    const voucher = await this.findById(voucherId);

    if (!voucher) {
      throw new NotFoundException("Voucher não encontrado");
    }

    if (voucher.status === "used") {
      throw new BadRequestException("Voucher já utilizado");
    }

    if (voucher.status === "expired") {
      throw new BadRequestException("Voucher expirado");
    }

    const { data: updatedVoucher, error } = await this.supabase
      .from("vouchers")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
      })
      .eq("id", voucherId)
      .select("*, restaurant:restaurants(*)")
      .single();

    if (error) {
      throw new Error(`Erro ao marcar voucher como usado: ${error.message}`);
    }

    return updatedVoucher as VoucherWithRestaurant;
  }

  async useVoucherByCode(code: string): Promise<VoucherWithRestaurant> {
    // Normalizar código
    const normalizedCode = code.toUpperCase().trim();

    const voucher = await this.findByCode(normalizedCode);

    if (!voucher) {
      throw new NotFoundException(`Voucher não encontrado: ${normalizedCode}`);
    }

    if (voucher.status === "used") {
      throw new BadRequestException("Voucher já utilizado");
    }

    if (voucher.status === "expired") {
      throw new BadRequestException("Voucher expirado");
    }

    // Usar o código do voucher encontrado (já normalizado do banco)
    const { data: updatedVoucher, error } = await this.supabase
      .from("vouchers")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
      })
      .eq("id", voucher.id)
      .select("*, restaurant:restaurants(*)")
      .single();

    if (error) {
      throw new Error(`Erro ao marcar voucher como usado: ${error.message}`);
    }

    // Verificar se realmente foi atualizado
    if (!updatedVoucher) {
      throw new Error("Falha ao atualizar voucher - nenhum dado retornado");
    }

    if (updatedVoucher.status !== "used") {
      throw new Error(`Falha ao atualizar status do voucher. Status atual: ${updatedVoucher.status}`);
    }

    return updatedVoucher as VoucherWithRestaurant;
  }
}
