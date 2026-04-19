import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import type { UserRole } from '../@types/auth'
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout'
import { RoleSegmentedControl } from '../components/ui/RoleSegmentedControl'
import { TextField } from '../components/ui/TextField'
import { useAuth } from '../hooks/useAuth'

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
  const { isLoading, login } = useAuth()
  const [submitError, setSubmitError] = useState('')

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
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7c3aed]">
            Login
          </p>
          <h2 className="font-display text-3xl font-semibold text-stone-950">
            Bem-vindo de volta
          </h2>
          <p className="text-sm leading-6 text-stone-500">
            Entre com seu perfil para acompanhar seus treinos e avaliações.
          </p>
        </div>

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
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          <button
            className="w-full rounded-2xl bg-stone-950 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/25 disabled:cursor-not-allowed disabled:opacity-65"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? 'Entrando...' : 'Entrar na plataforma'}
          </button>

          <p className="text-center text-sm text-stone-500">
            Nao tem conta?{' '}
            <span className="font-medium text-[#7c3aed]">Fale com seu personal</span>
          </p>

          <div className="rounded-2xl border border-[#e9d5ff] bg-[#faf5ff] px-4 py-3">
            <p className="text-xs font-medium text-[#7c3aed]">
              Acesso de demonstracao
            </p>
            <p className="mt-1 text-xs leading-5 text-[#6d28d9]">
              Use telefone e senha validos para testar o fluxo por perfil.
            </p>
          </div>
        </form>
      </div>
    </AuthSplitLayout>
  )
}
