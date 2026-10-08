import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout'
import { TextField } from '../components/ui/TextField'
import { useAuth } from '../hooks/useAuth'
import { SESSION_EXPIRED_STORAGE_KEY } from '../services/api'
import { formatPhone } from '../utils/formatPhone'

const loginSchema = z.object({
  phone: z
    .string()
    .min(10, 'Informe um telefone valido.')
    .refine(
      (value) => value.replace(/\D/g, '').length >= 10,
      'Informe um telefone valido.',
    ),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login, user } = useAuth()
  const [submitError, setSubmitError] = useState('')
  const [sessionExpiredMessage] = useState(() =>
    sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY)
      ? 'Sua sessão expirou. Faça login novamente.'
      : '',
  )

  useEffect(() => {
    sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY)
  }, [])

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      phone: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  })

  if (isAuthenticated && user) {
    return <Navigate replace to="/dashboard/admin" />
  }

  const phoneRegistration = register('phone')

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError('')

    try {
      await login(values)
      navigate('/dashboard/admin')
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel concluir o login agora.',
      )
    }
  }

  const submitLogin = handleSubmit(onSubmit)

  return (
    <AuthSplitLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
            Login
          </p>
          <h2 className="font-display text-3xl font-semibold text-ink">
            Bem-vindo de volta
          </h2>
          <p className="text-sm leading-6 text-mute">
            Entre para gerenciar seus alunos, treinos e avaliações.
          </p>
        </div>

        {sessionExpiredMessage ? (
          <p className="text-sm text-amber-400 light:text-amber-600">
            {sessionExpiredMessage}
          </p>
        ) : null}

        <form
          action="#"
          className="space-y-4"
          method="post"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void submitLogin(event)
          }}
        >
          <TextField
            autoComplete="tel"
            error={errors.phone?.message}
            id="phone"
            label="Telefone"
            placeholder="(65) 99999-9999"
            type="tel"
            {...phoneRegistration}
            onChange={(event) => {
              event.target.value = formatPhone(event.target.value)
              phoneRegistration.onChange(event)
            }}
          />

          <TextField
            autoComplete="current-password"
            error={errors.password?.message}
            id="password"
            label="Senha"
            placeholder="Digite sua senha"
            type="password"
            {...register('password')}
          />

          {submitError ? (
            <p className="text-sm text-rose-400 light:text-rose-600">
              {submitError}
            </p>
          ) : null}

          <button
            className="btn-primary w-full py-3.5 focus:outline-none focus:ring-4 focus:ring-accent/25"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? 'Entrando...' : 'Entrar na plataforma'}
          </button>

          <p className="text-center text-xs leading-5 text-faint">
            Acesso de demonstração · quaisquer erros encontrados, notificar o desenvolvedor.
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  )
}
