export default function ValidatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
          Validação de voucher
        </h1>
        <p className="mb-6 text-center text-xs text-zinc-500">
          Tela simplificada para uso pelo restaurante parceiro durante o MVP.
        </p>
        <form className="space-y-4">
          <div className="space-y-1 text-sm">
            <label htmlFor="cpf" className="block font-medium text-zinc-800">
              CPF do cliente
            </label>
            <input
              id="cpf"
              type="text"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="code" className="block font-medium text-zinc-800">
              Código do voucher
            </label>
            <input
              id="code"
              type="text"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Validar voucher
          </button>
        </form>
      </div>
    </div>
  );
}

