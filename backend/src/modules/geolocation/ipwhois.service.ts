import { Injectable } from "@nestjs/common";

export interface IpwhoisResponse {
  success: boolean;
  ip: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  latitude: number;
  longitude: number;
}

// IPs privados/localhost que nao devem ser consultados
const PRIVATE_IP_REGEX =
  /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|0\.0\.0\.0|localhost)/;

@Injectable()
export class IpwhoisService {
  /**
   * Verifica se um IP e privado/localhost.
   */
  isPrivateIp(ip: string): boolean {
    return !ip || PRIVATE_IP_REGEX.test(ip);
  }

  /**
   * Busca o IP publico do servidor (para fallback quando IP local).
   * Chama ipwho.is sem IP para obter o IP de saida do servidor.
   */
  async getPublicIp(): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch("https://ipwho.is/", {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) return null;

      const data = await response.json();
      return data.success && data.ip ? data.ip : null;
    } catch {
      return null;
    }
  }

  /**
   * Consulta IPWHOIS.IO para um IP especifico.
   * Para IPs privados, tenta detectar o IP publico do servidor como fallback.
   */
  async lookup(ip: string): Promise<IpwhoisResponse | null> {
    let targetIp = ip;

    if (this.isPrivateIp(ip)) {
      console.log(`[IPWHOIS] IP privado detectado (${ip}), buscando IP publico...`);
      const publicIp = await this.getPublicIp();
      if (!publicIp) {
        console.log("[IPWHOIS] Nao foi possivel detectar IP publico");
        return null;
      }
      console.log(`[IPWHOIS] IP publico detectado: ${publicIp}`);
      targetIp = publicIp;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`https://ipwho.is/${targetIp}`, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.success) {
        return null;
      }

      return {
        success: data.success,
        ip: data.ip,
        country: data.country,
        country_code: data.country_code,
        region: data.region,
        region_code: data.region_code,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    } catch {
      return null;
    }
  }
}
