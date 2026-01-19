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

    // Verificar se já existem vouchers para este pass
    const { data: existingVouchers } = await this.supabase
      .from("vouchers")
      .select("*, restaurant:restaurants(*)")
      .eq("pass_id", passId);

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
    // Buscar restaurantes que já têm voucher para este usuário
    const existingRestaurantIds = new Set(
      existingVouchers?.map((v) => v.restaurant_id) || []
    );

    // Filtrar restaurantes que ainda não têm voucher
    const restaurantsToCreate = restaurants.filter(
      (r) => !existingRestaurantIds.has(r.id)
    );

    // Se todos os restaurantes já têm voucher, retornar os existentes
    if (restaurantsToCreate.length === 0) {
      return existingVouchers || [];
    }

    // Gerar vouchers apenas para restaurantes que não têm voucher
    const vouchersToInsert = restaurantsToCreate.map((restaurant) => ({
      code: this.generateVoucherCode(),
      profile_id: profileId,
      pass_id: passId,
      restaurant_id: restaurant.id,
      status: "available" as const,
    }));

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

  async listForUser(profileId: string): Promise<VoucherWithRestaurant[]> {
    // Tentar buscar vouchers existentes
    const { data: vouchers, error } = await this.supabase
      .from("vouchers")
      .select("*, restaurant:restaurants(*)")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar vouchers: ${error.message}`);
    }

    // Se não há vouchers, gerar novos
    if (!vouchers || vouchers.length === 0) {
      const newVouchers = await this.generateVouchersForUser(profileId);
      return newVouchers as VoucherWithRestaurant[];
    }

    return vouchers as VoucherWithRestaurant[];
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

    const { data: voucher, error } = await this.supabase
      .from("vouchers")
      .select("*, restaurant:restaurants(*), profile:profiles(full_name, cpf)")
      .eq("code", normalizedCode)
      .single();

    if (error || !voucher) {
      return null;
    }

    return voucher as VoucherWithRestaurant & { profile?: { full_name: string; cpf: string } };
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
    const voucher = await this.findByCode(code);

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
      .eq("id", voucher.id)
      .select("*, restaurant:restaurants(*)")
      .single();

    if (error) {
      throw new Error(`Erro ao marcar voucher como usado: ${error.message}`);
    }

    return updatedVoucher as VoucherWithRestaurant;
  }
}
