import { Injectable, Inject } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../../config/supabase.config";
import { IpwhoisService } from "./ipwhois.service";

export interface GeoData {
  state: string;
  state_name: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface CityStats {
  city: string;
  count: number;
}

export interface OtherStateStats {
  state: string;
  state_name: string;
  count: number;
}

export interface GeoStatsResponse {
  cities: CityStats[];
  otherStates: OtherStateStats[];
  otherStatesTotal: number;
  total: number;
}

@Injectable()
export class GeolocationService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly ipwhoisService: IpwhoisService,
  ) {}

  /**
   * Resolve IP para localizacao. Usa cache, so chama IPWHOIS.IO se IP novo.
   */
  async resolveIp(rawIp: string): Promise<GeoData | null> {
    const ip = this.cleanIp(rawIp);

    // Verificar cache
    const { data: cached } = await this.supabase
      .from("ip_geo_cache")
      .select("state, state_name, city, latitude, longitude")
      .eq("ip", ip)
      .single();

    if (cached) {
      return cached as GeoData;
    }

    // Consultar IPWHOIS.IO
    const result = await this.ipwhoisService.lookup(ip);
    if (!result) {
      return null;
    }

    const geoData: GeoData = {
      state: result.region_code || "",
      state_name: result.region || "",
      city: result.city || "",
      latitude: result.latitude,
      longitude: result.longitude,
    };

    // Salvar no cache (fire-and-forget)
    this.supabase
      .from("ip_geo_cache")
      .upsert({
        ip,
        state: geoData.state,
        state_name: geoData.state_name,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        raw_response: result,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error("Erro ao salvar ip_geo_cache:", error.message);
      });

    return geoData;
  }

  /**
   * Limpa IP removendo prefixo ::ffff: (IPv4-mapped IPv6).
   */
  private cleanIp(ip: string): string {
    return ip.replace(/^::ffff:/, "");
  }

  /**
   * Registra evento de geolocalizacao.
   */
  async trackLoginEvent(profileId: string, rawIp: string): Promise<void> {
    const ip = this.cleanIp(rawIp);
    console.log(`[GEO] trackLoginEvent: profileId=${profileId}, ip=${ip}`);

    try {
      const geo = await this.resolveIp(ip);
      console.log(`[GEO] resolveIp result:`, geo ? `${geo.city}, ${geo.state}` : "null (IP privado ou erro)");

      const { error: insertError } = await this.supabase.from("user_geo_events").insert({
        profile_id: profileId,
        ip,
        state: geo?.state || null,
        state_name: geo?.state_name || null,
        city: geo?.city || null,
        event_type: "login",
      });

      if (insertError) {
        console.error("[GEO] Erro ao inserir user_geo_events:", insertError.message, insertError);
      } else {
        console.log(`[GEO] Evento registrado com sucesso para ${profileId}`);
      }
    } catch (error: any) {
      console.error("[GEO] Erro inesperado em trackLoginEvent:", error?.message);
    }
  }

  /**
   * Busca estatisticas por cidade (RO) + outros estados.
   */
  async getStatsByCity(days: number = 30): Promise<GeoStatsResponse> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: events, error } = await this.supabase
      .from("user_geo_events")
      .select("city, state, state_name")
      .gte("created_at", since.toISOString())
      .not("city", "is", null);

    if (error) {
      throw new Error(`Erro ao buscar geo stats: ${error.message}`);
    }

    const cityMap = new Map<string, number>();
    const otherStatesMap = new Map<string, { state: string; state_name: string; count: number }>();
    let total = 0;

    for (const event of events || []) {
      total++;

      if (event.state === "RO") {
        const city = event.city || "Desconhecida";
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
      } else {
        const key = event.state || "??";
        const existing = otherStatesMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          otherStatesMap.set(key, {
            state: event.state || "??",
            state_name: event.state_name || "Desconhecido",
            count: 1,
          });
        }
      }
    }

    const cities: CityStats[] = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    const otherStates: OtherStateStats[] = Array.from(otherStatesMap.values())
      .sort((a, b) => b.count - a.count);

    const otherStatesTotal = otherStates.reduce((sum, s) => sum + s.count, 0);

    return { cities, otherStates, otherStatesTotal, total };
  }

  /**
   * Busca eventos recentes com info do usuario.
   */
  async getRecentEvents(limit: number = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("user_geo_events")
      .select("id, ip, city, state, state_name, event_type, created_at, profile:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar geo events: ${error.message}`);
    }

    return (data || []).map((e: any) => ({
      id: e.id,
      ip: e.ip,
      city: e.city,
      state: e.state,
      state_name: e.state_name,
      event_type: e.event_type,
      created_at: e.created_at,
      user_name: Array.isArray(e.profile) ? e.profile[0]?.full_name : e.profile?.full_name,
    }));
  }
}
