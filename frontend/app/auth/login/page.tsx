export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          Fazer login
        </h1>
        <form className="space-y-4">
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
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-500">
          Ainda não tem conta?{" "}
          <a href="/auth/register" className="font-medium text-emerald-700 hover:underline">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}

