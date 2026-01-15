export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-12 md:px-10 md:py-16">
        <header className="flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-emerald-600">ROC</span> Passaporte
          </div>
          <nav className="flex gap-3 text-sm font-medium">
            <a href="/auth/login" className="rounded-full px-4 py-2 hover:bg-zinc-100">
              Login
            </a>
            <a
              href="/auth/register"
              className="rounded-full bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              Cadastro
            </a>
          </nav>
        </header>

        <section className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Passaporte ROC: 25 restaurantes, 90 dias para economizar em Rondônia.
            </h1>
            <p className="text-base leading-relaxed text-zinc-600 md:text-lg">
              Compre seu passaporte digital por R$ 99,99 e desbloqueie 25 vouchers exclusivos,
              um em cada restaurante participante nas principais cidades de Rondônia.
            </p>
            <div className="flex flex-col gap-3 text-sm text-zinc-700">
              <div>✓ 25 restaurantes parceiros em 5 cidades</div>
              <div>✓ 90 dias de validade a partir do início da campanha</div>
              <div>✓ Uso simples por QR Code ou código no próprio celular</div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/checkout"
                className="flex-1 rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Comprar meu passaporte
              </a>
              <a
                href="#como-funciona"
                className="flex-1 rounded-full border border-zinc-200 px-6 py-3 text-center text-sm font-semibold hover:bg-zinc-100"
              >
                Como funciona
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase text-emerald-700">
              Fora da campanha
            </h2>
            <p className="mb-4 text-sm text-zinc-600">
              A próxima temporada de descontos está chegando. Cadastre-se e seja o primeiro a
              saber.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Entrar na lista de espera
              </button>
            </form>
          </div>
        </section>

        <section id="como-funciona" className="grid gap-8 border-t border-zinc-100 pt-10 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase text-zinc-700">1. Compre o passaporte</h3>
            <p className="text-sm text-zinc-600">
              Durante a campanha, você realiza o pagamento único de R$ 99,99 no site.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase text-zinc-700">2. Acesse os vouchers</h3>
            <p className="text-sm text-zinc-600">
              Dentro da área do assinante, você encontra os 25 vouchers, filtrando por cidade.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase text-zinc-700">3. Use no restaurante</h3>
            <p className="text-sm text-zinc-600">
              No local, abra o voucher, gere o QR Code ou código e apresente para validação.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
