import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import type { UserRole } from '../@types/auth'
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout'
import { RoleSegmentedControl } from '../components/ui/RoleSegmentedControl'
import { TextField } from '../components/ui/TextField'
import { useAuth } from '../hooks/useAuth'
import { SESSION_EXPIRED_STORAGE_KEY } from '../services/api'

const loginSchema = z.object({
  phone: z
    .string()
    .min(10, 'Informe um telefone valido.')
    .refine(
      (value) => value.replace(/\D/g, '').length >= 10,
      'Informe um telefone valido.',
    ),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
  role: z.enum(['PERSONAL', 'ALUNO']),
})

type LoginFormValues = z.infer<typeof loginSchema>

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits ? `(${digits}` : ''
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login, user } = useAuth()
  const [submitError, setSubmitError] = useState('')
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY)) {
      sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY)
      setSessionExpiredMessage('Sua sessão expirou. Faça login novamente.')
    }
  }, [])

  if (isAuthenticated && user?.accessToken) {
    return (
      <Navigate
        replace
        to={user.role === 'PERSONAL' ? '/dashboard/admin' : '/dashboard/aluno'}
      />
    )
  }

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<LoginFormValues>({
    defaultValues: {
      phone: '',
      password: '',
      role: 'PERSONAL',
    },
    resolver: zodResolver(loginSchema),
  })

  const role = useWatch({
    control,
    name: 'role',
  })

  const handleRoleChange = (selectedRole: UserRole) => {
    setValue('role', selectedRole, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  const phoneRegistration = register('phone')

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError('')

    try {
      const authenticatedUser = await login(values)
      navigate(
        authenticatedUser.role === 'PERSONAL'
          ? '/dashboard/admin'
          : '/dashboard/aluno',
      )
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
            Entre com seu perfil para acompanhar seus treinos e avaliações.
          </p>
        </div>

        {sessionExpiredMessage ? (
          <p className="text-sm text-amber-400 light:text-amber-600">
            {sessionExpiredMessage}
          </p>
        ) : null}

        <RoleSegmentedControl onChange={handleRoleChange} value={role} />

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
