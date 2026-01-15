export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          Criar conta
        </h1>
        <form className="space-y-4">
          <div className="space-y-1 text-sm">
            <label htmlFor="name" className="block font-medium text-zinc-800">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="cpf" className="block font-medium text-zinc-800">
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="block font-medium text-zinc-800">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="password" className="block font-medium text-zinc-800">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="passwordConfirmation" className="block font-medium text-zinc-800">
              Confirmar senha
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-700">
            <input id="terms" type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
            <label htmlFor="terms">
              Eu li e aceito os termos de uso do Rondônia Oferta Club.
            </label>
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Criar conta
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-500">
          Já tem uma conta?{" "}
          <a href="/auth/login" className="font-medium text-emerald-700 hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}

