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
  async lookup(ip: string): Promise<IpwhoisResponse | null> {
    if (!ip || PRIVATE_IP_REGEX.test(ip)) {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`https://ipwho.is/${ip}`, {
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
