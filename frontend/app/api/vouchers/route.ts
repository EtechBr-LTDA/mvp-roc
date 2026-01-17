import { NextResponse } from "next/server";
import { apiClient } from "@/app/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Função auxiliar para gerar código de voucher
function generateVoucherCode(id: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = String(id).padStart(5, "0").slice(0, 5);
  return `ROC-${suffix}`;
}

// Função para adaptar dados do backend para formato esperado pelo frontend
function adaptBackendVouchers(backendVouchers: any[], userId: number, userName?: string) {
  return {
    profile: userName ? { name: userName } : undefined,
    vouchers: backendVouchers.map((voucher) => ({
      id: voucher.id.toString(),
      code: generateVoucherCode(voucher.id),
      restaurantName: voucher.restaurantName,
      city: voucher.city,
      discountLabel: "10% OFF", // Valor padrão - pode ser melhorado no backend
      used: voucher.used || false,
      imageUrl: null, // Pode ser melhorado no backend
    })),
  };
}

export async function GET(request: Request) {
  try {
    // Obter token do header Authorization
    const authHeader = request.headers.get("authorization");
    
    // Tentar obter userId do token ou header
    let userId: number | null = null;
    if (authHeader) {
      // Extrair userId do token (implementação básica - em produção usar JWT)
      try {
        const userIdHeader = request.headers.get("x-user-id");
        if (userIdHeader) {
          userId = parseInt(userIdHeader, 10);
        }
      } catch {
        // Ignorar se não conseguir extrair
      }
    }

    if (!userId && !authHeader) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login primeiro." },
        { status: 401 }
      );
    }

    // Fazer requisição ao backend
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    if (userId) {
      headers["x-user-id"] = userId.toString();
    }

    const response = await fetch(`${BACKEND_URL}/vouchers`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
      throw new Error(errorData.message || "Erro ao buscar vouchers");
    }

    const backendVouchers = await response.json();

    // Adaptar dados do backend para formato esperado pelo frontend
    const adapted = adaptBackendVouchers(backendVouchers, userId || 0);

    return NextResponse.json(adapted);
  } catch (error: any) {
    console.error("Erro ao listar vouchers:", error);
    return NextResponse.json(
      { error: error.message || "Não foi possível carregar os vouchers." },
      { status: 500 }
    );
  }
}

