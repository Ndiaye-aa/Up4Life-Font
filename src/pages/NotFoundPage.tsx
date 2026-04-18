import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-[#f6f8f4] px-4">
    <div className="max-w-md rounded-[2rem] border border-[#d9e3dc] bg-white p-8 text-center shadow-[0_16px_48px_rgba(25,52,45,0.08)]">
      <p className="text-sm uppercase tracking-[0.22em] text-[#2a7d67]">404</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-stone-950">
        Pagina nao encontrada
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-500">
        A rota solicitada nao existe nesta estrutura inicial.
      </p>
      <Link
        className="mt-6 inline-flex rounded-2xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        to="/login"
      >
        Voltar para login
      </Link>
    </div>
  </main>
)
