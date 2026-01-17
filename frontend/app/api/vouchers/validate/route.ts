import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

function extractCode(raw: string) {
  const trimmed = raw.trim().toUpperCase();

  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("code");
    if (fromQuery) {
      return fromQuery.toUpperCase();
    }
  } catch {
  }

  const cleaned = trimmed.replace(/[^A-Z0-9-]/g, "");

  if (cleaned.startsWith("ROC-") && cleaned.length === 9) {
    return cleaned;
  }

  if (cleaned.startsWith("ROC") && cleaned.length === 8) {
    return `ROC-${cleaned.slice(3)}`;
  }

  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCode = String(body.code || "");

    if (!rawCode.trim()) {
      return NextResponse.json(
        { valid: false, reason: "Código não informado." },
        { status: 400 }
      );
    }

    const normalizedCode = extractCode(rawCode);

    // Fazer requisição ao backend
    const response = await fetch(`${BACKEND_URL}/validation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: normalizedCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          valid: false,
          reason: data.message || "Erro ao validar cupom.",
          voucher: data.voucher || null,
        },
        { status: response.status }
      );
    }

    // Adaptar resposta do backend para formato esperado pelo frontend
    return NextResponse.json({
      valid: true,
      voucher: {
        id: data.voucher?.id,
        code: data.voucher?.code || normalizedCode,
        restaurant: data.voucher?.restaurant || {
          name: data.voucher?.restaurantName,
          city: data.voucher?.city,
          offer: data.voucher?.restaurant?.offer || "Desconto válido",
        },
      },
    });
  } catch (error: any) {
    console.error("Erro ao validar voucher:", error);
    return NextResponse.json(
      { valid: false, reason: error.message || "Erro inesperado ao validar o cupom." },
      { status: 500 }
    );
  }
}

