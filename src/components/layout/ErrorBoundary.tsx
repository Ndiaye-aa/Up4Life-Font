import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-6">
            <div className="w-full max-w-md rounded-[2rem] border border-rose-200 bg-white p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-rose-500">
                Erro
              </p>
              <h1 className="font-display mt-3 text-2xl font-semibold text-stone-950">
                Algo deu errado
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Nao foi possivel carregar esta pagina. Tente recarregar ou entre em contato com o suporte.
              </p>
              <button
                className="mt-6 w-full rounded-xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                onClick={() => window.location.reload()}
                type="button"
              >
                Recarregar pagina
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
