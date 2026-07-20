import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
    <div className="max-w-md text-center">
      <p className="text-sm uppercase tracking-[0.22em] text-accent">404</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-ink">
        Pagina nao encontrada
      </h1>
      <p className="mt-3 text-sm leading-6 text-mute">
        A rota solicitada nao existe nesta estrutura inicial.
      </p>
      <Link className="btn-primary mt-6 inline-flex" to="/login">
        Voltar para login
      </Link>
    </div>
  </main>
)
