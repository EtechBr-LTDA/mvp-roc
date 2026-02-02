import { Injectable, Inject } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../../config/supabase.config";

@Injectable()
export class StatsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async getUserStats(startDate?: string, endDate?: string) {
    const { data, error } = await this.supabase.rpc("get_user_demographics", {
      p_start_date: startDate || null,
      p_end_date: endDate || null,
    });

    if (error) {
      console.error("[STATS] Erro get_user_demographics:", error.message);
      // Fallback: calcular manualmente
      return this.getUserStatsFallback(startDate, endDate);
    }

    return data;
  }

  async getFinancialStats(startDate?: string, endDate?: string) {
    const { data, error } = await this.supabase.rpc("get_financial_stats", {
      p_start_date: startDate || null,
      p_end_date: endDate || null,
    });

    if (error) {
      console.error("[STATS] Erro get_financial_stats:", error.message);
      return this.getFinancialStatsFallback(startDate, endDate);
    }

    return data;
  }

  // Fallbacks caso as funcoes RPC nao existam ainda
  private async getUserStatsFallback(startDate?: string, endDate?: string) {
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: suspendedUsers },
    ] = await Promise.all([
      this.supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
      this.supabase.from("profiles").select("*", { count: "exact", head: true })
        .eq("role", "user")
        .not("id", "is", null)
        .in("id", []),  // placeholder - active = has pass
      this.supabase.from("profiles").select("*", { count: "exact", head: true })
        .eq("role", "user")
        .not("suspended_at", "is", null),
    ]);

    // Contar usuarios com passe ativo
    const { count: activeWithPass } = await this.supabase
      .from("passes")
      .select("profile_id", { count: "exact", head: true })
      .eq("status", "active");

    // Novos usuarios no periodo
    let newUsersQuery = this.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "user");

    if (startDate) newUsersQuery = newUsersQuery.gte("created_at", startDate);
    if (endDate) newUsersQuery = newUsersQuery.lte("created_at", endDate);

    const { count: newUsers } = await newUsersQuery;

    return {
      total_users: totalUsers || 0,
      new_users: newUsers || 0,
      active_users: activeWithPass || 0,
      suspended_users: suspendedUsers || 0,
      gender_distribution: [],
      age_ranges: [],
      average_age: null,
    };
  }

  private async getFinancialStatsFallback(startDate?: string, endDate?: string) {
    const PASS_PRICE = 99.99;

    const [
      { count: totalPasses },
      { count: activePasses },
    ] = await Promise.all([
      this.supabase.from("passes").select("*", { count: "exact", head: true }),
      this.supabase.from("passes").select("*", { count: "exact", head: true }).eq("status", "active"),
    ]);

    let periodQuery = this.supabase
      .from("passes")
      .select("*", { count: "exact", head: true });

    if (startDate) periodQuery = periodQuery.gte("created_at", startDate);
    if (endDate) periodQuery = periodQuery.lte("created_at", endDate);

    const { count: periodPasses } = await periodQuery;

    // Voucher stats
    const [
      { count: totalVouchers },
      { count: availableVouchers },
      { count: usedVouchers },
      { count: expiredVouchers },
    ] = await Promise.all([
      this.supabase.from("vouchers").select("*", { count: "exact", head: true }),
      this.supabase.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "available"),
      this.supabase.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "used"),
      this.supabase.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "expired"),
    ]);

    return {
      pass_price: PASS_PRICE,
      total_passes: totalPasses || 0,
      active_passes: activePasses || 0,
      expired_passes: (totalPasses || 0) - (activePasses || 0),
      total_revenue: (totalPasses || 0) * PASS_PRICE,
      active_revenue: (activePasses || 0) * PASS_PRICE,
      period_passes: periodPasses || 0,
      period_revenue: (periodPasses || 0) * PASS_PRICE,
      monthly_breakdown: [],
      voucher_stats: {
        total: totalVouchers || 0,
        available: availableVouchers || 0,
        used: usedVouchers || 0,
        expired: expiredVouchers || 0,
      },
    };
  }
}
