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

export interface LocationStats {
  city?: string;
  state?: string;
  state_name?: string;
  unique_users: number;
  total_events: number;
}

export interface GeoStatsResponse {
  totals: {
    unique_users: number;
    total_events: number;
    new_users: number;
    returning_users: number;
  };
  cities: LocationStats[];
  other_states: LocationStats[];
  all_states: LocationStats[];
  weekly_trend: {
    week: string;
    unique_users: number;
    total_events: number;
    new_users: number;
  }[];
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
  async trackLoginEvent(profileId: string, rawIp: string, eventType: string = "login"): Promise<void> {
    const ip = this.cleanIp(rawIp);
    console.log(`[GEO] trackEvent: profileId=${profileId}, ip=${ip}, type=${eventType}`);

    try {
      const geo = await this.resolveIp(ip);
      console.log(`[GEO] resolveIp result:`, geo ? `${geo.city}, ${geo.state}` : "null (IP privado ou erro)");

      const { error: insertError } = await this.supabase.from("user_geo_events").insert({
        profile_id: profileId,
        ip,
        state: geo?.state || null,
        state_name: geo?.state_name || null,
        city: geo?.city || null,
        event_type: eventType,
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
   * Busca estatisticas geograficas com usuarios unicos e total de eventos.
   * Usa funcao RPC do Supabase, com fallback manual.
   */
  async getGeoStats(
    days: number = 30,
    eventTypes: string[] = ["login", "register"],
  ): Promise<GeoStatsResponse> {
    // Tentar RPC primeiro
    const { data, error } = await this.supabase.rpc("get_geo_stats", {
      p_days: days,
      p_event_types: eventTypes,
    });

    if (!error && data) {
      return data as GeoStatsResponse;
    }

    console.error("[GEO] RPC get_geo_stats falhou, usando fallback:", error?.message);
    return this.getGeoStatsFallback(days, eventTypes);
  }

  /**
   * Fallback caso a funcao RPC nao exista ainda.
   */
  private async getGeoStatsFallback(
    days: number,
    eventTypes: string[],
  ): Promise<GeoStatsResponse> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    let query = this.supabase
      .from("user_geo_events")
      .select("profile_id, city, state, state_name")
      .gte("created_at", since.toISOString())
      .not("city", "is", null);

    if (eventTypes.length > 0) {
      query = query.in("event_type", eventTypes);
    }

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar geo stats: ${error.message}`);
    }

    // Calcular unique users e total events
    const cityMap = new Map<string, { users: Set<string>; count: number }>();
    const stateMap = new Map<string, { state_name: string; users: Set<string>; count: number }>();
    const allUsers = new Set<string>();

    for (const event of events || []) {
      allUsers.add(event.profile_id);

      const stateKey = event.state || "??";
      if (!stateMap.has(stateKey)) {
        stateMap.set(stateKey, { state_name: event.state_name || "Desconhecido", users: new Set(), count: 0 });
      }
      const stateEntry = stateMap.get(stateKey)!;
      stateEntry.users.add(event.profile_id);
      stateEntry.count++;

      if (event.state === "RO") {
        const city = event.city || "Desconhecida";
        if (!cityMap.has(city)) {
          cityMap.set(city, { users: new Set(), count: 0 });
        }
        const cityEntry = cityMap.get(city)!;
        cityEntry.users.add(event.profile_id);
        cityEntry.count++;
      }
    }

    const cities: LocationStats[] = Array.from(cityMap.entries())
      .map(([city, data]) => ({ city, unique_users: data.users.size, total_events: data.count }))
      .sort((a, b) => b.unique_users - a.unique_users);

    const allStates: LocationStats[] = Array.from(stateMap.entries())
      .map(([state, data]) => ({ state, state_name: data.state_name, unique_users: data.users.size, total_events: data.count }))
      .sort((a, b) => b.unique_users - a.unique_users);

    const otherStates = allStates.filter((s) => s.state !== "RO");

    return {
      totals: {
        unique_users: allUsers.size,
        total_events: (events || []).length,
        new_users: 0,
        returning_users: 0,
      },
      cities,
      other_states: otherStates,
      all_states: allStates,
      weekly_trend: [],
    };
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
