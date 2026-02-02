import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../../config/supabase.config";

@Injectable()
export class SystemSettingsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async getAllSettings() {
    const { data, error } = await this.supabase
      .from("system_settings")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true });

    if (error) throw new Error(`Erro ao listar configuracoes: ${error.message}`);

    // Agrupar por categoria
    const grouped: Record<string, any[]> = {};
    (data || []).forEach((s: any) => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push({
        ...s,
        value: s.value, // JSONB - ja vem parseado pelo Supabase
      });
    });

    return { settings: data || [], grouped };
  }

  async getSetting(key: string) {
    const { data, error } = await this.supabase
      .from("system_settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error || !data) throw new NotFoundException(`Configuracao '${key}' nao encontrada`);
    return data;
  }

  async updateSetting(key: string, value: any, updatedBy: string) {
    const { data, error } = await this.supabase
      .from("system_settings")
      .update({
        value: typeof value === "string" ? JSON.parse(`"${value}"`) : value,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      })
      .eq("key", key)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar '${key}': ${error.message}`);
    return data;
  }

  async updateMultipleSettings(settings: Record<string, any>, updatedBy: string) {
    const results: any[] = [];

    for (const [key, value] of Object.entries(settings)) {
      const { data, error } = await this.supabase
        .from("system_settings")
        .update({
          value,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key)
        .select()
        .single();

      if (error) {
        console.error(`[SETTINGS] Erro ao atualizar '${key}':`, error.message);
        continue;
      }
      results.push(data);
    }

    return { updated: results.length, settings: results };
  }
}
