interface VoucherPageProps {
  params: {
    id: string;
  };
}

export default function VoucherPage({ params }: VoucherPageProps) {
  const voucherId = params.id;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase text-zinc-500">Voucher</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Restaurante parceiro #{voucherId}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Ao chegar no restaurante, clique em usar agora para gerar o código de validação.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Usar agora
        </button>
        <p className="mt-4 text-xs text-zinc-500">
          Cada voucher pode ser utilizado uma única vez durante a campanha.
        </p>
      </div>
    </div>
  );
}

