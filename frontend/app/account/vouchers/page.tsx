const vouchers = new Array(25).fill(null).map((_, index) => ({
  id: index + 1,
  restaurantName: `Restaurante ${index + 1}`,
  city: index % 5 === 0 ? "Porto Velho" : "Outra cidade",
  used: false
}));

export default function VouchersPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Meus vouchers</h1>
            <p className="text-sm text-zinc-600">
              Acompanhe seus 25 vouchers do Passaporte ROC e filtre por cidade.
            </p>
          </div>
          <select className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            <option value="">Todas as cidades</option>
            <option value="Porto Velho">Porto Velho</option>
            <option value="Outra cidade">Outras cidades</option>
          </select>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {vouchers.map((voucher) => (
            <a
              key={voucher.id}
              href={`/account/vouchers/${voucher.id}`}
              className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm transition hover:border-emerald-400"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase text-zinc-500">
                  Voucher #{voucher.id}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    voucher.used
                      ? "bg-zinc-100 text-zinc-500"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {voucher.used ? "Utilizado" : "Disponível"}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-zinc-900">{voucher.restaurantName}</h2>
              <p className="mt-1 text-xs text-zinc-600">{voucher.city}</p>
            </a>
          ))}
        </section>
      </div>
    </div>
  );
}

