import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const voucherId = context.params.id;
    const numVoucherId = parseInt(voucherId, 10);

    if (isNaN(numVoucherId) || numVoucherId <= 0) {
      return NextResponse.json(
        { error: "ID de voucher inválido." },
        { status: 400 }
      );
    }

    // Obter token do header Authorization
    const authHeader = request.headers.get("authorization");
    const userIdHeader = request.headers.get("x-user-id");
    const userId = userIdHeader ? parseInt(userIdHeader, 10) : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    if (userId) {
      headers["x-user-id"] = userId.toString();
    }

    // Fazer requisição ao backend
    const response = await fetch(`${BACKEND_URL}/vouchers/${numVoucherId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
      return NextResponse.json(
        { error: errorData.message || "Erro ao buscar voucher." },
        { status: response.status }
      );
    }

    const backendVoucher = await response.json();

    // Adaptar resposta do backend para formato esperado pelo frontend
    return NextResponse.json({
      id: backendVoucher.id.toString(),
      code: `ROC-${String(backendVoucher.id).padStart(5, "0")}`,
      used: backendVoucher.used || false,
      restaurant: {
        name: backendVoucher.restaurantName,
        city: backendVoucher.city,
        discount: "10% OFF", // Valor padrão - pode ser melhorado no backend
        imageUrl: null, // Pode ser melhorado no backend
        category: null, // Pode ser melhorado no backend
      },
    });
  } catch (error: any) {
    console.error("Erro ao carregar detalhes do voucher:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao carregar detalhes do voucher." },
      { status: 500 }
    );
  }
}

