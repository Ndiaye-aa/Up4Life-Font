import { Calendar, Phone, Save, Shield, Target, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardShell } from '../components/layout/DashboardShell'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'

export const StudentProfilePage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [bio, setBio] = useState(
    'Aluno focado em consistencia, evolucao corporal e qualidade de vida no longo prazo.',
  )

  return (
    <DashboardShell
      contact={user?.phone ?? ''}
      name={user?.name ?? 'Aluno'}
      navItems={getDashboardNavItems('ALUNO')}
      onLogout={() => {
        logout()
        navigate('/login')
      }}
      overviewItems={[
        { label: 'Treinos', value: '24' },
        { label: 'Sequencia', value: '7d' },
        { label: 'Aval.', value: '4' },
      ]}
      roleLabel="Aluno"
      subtitle="Area pessoal para acompanhar identidade, rotina e configuracoes basicas."
      tone="student"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="flex items-center justify-between rounded-[2rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div>
            <h1 className="font-display text-3xl font-semibold text-stone-950">Meu Perfil</h1>
            <p className="mt-1 text-sm text-stone-500">Visualize e atualize seus dados pessoais.</p>
          </div>
          <button
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              editing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-stone-950 text-white hover:bg-stone-800'
            }`}
            onClick={() => setEditing(!editing)}
            type="button"
          >
            {editing ? 'Cancelar' : 'Editar'}
          </button>
        </section>

        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-2xl text-white">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-stone-950">{user?.name}</h2>
              <p className="truncate text-sm text-stone-500">{user?.phone}</p>
              <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
                Aluno
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 font-display text-2xl font-semibold text-stone-950">Dados Pessoais</h3>
          <div className="space-y-3">
            <label className="block text-sm text-stone-600">
              <span className="mb-1.5 flex items-center gap-2"><User size={13} />Nome completo</span>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10"
                disabled={!editing}
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-stone-600">
                <span className="mb-1.5 flex items-center gap-2"><Phone size={13} />Telefone</span>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10"
                  disabled={!editing}
                  onChange={(event) => setPhone(event.target.value)}
                  value={phone}
                />
              </label>
              <label className="block text-sm text-stone-600">
                <span className="mb-1.5 flex items-center gap-2"><Calendar size={13} />Data de nascimento</span>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10"
                  defaultValue="1999-05-14"
                  disabled={!editing}
                  type="date"
                />
              </label>
            </div>
            <label className="block text-sm text-stone-600">
              <span className="mb-1.5 flex items-center gap-2"><Target size={13} />Objetivo / Bio</span>
              <textarea
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10"
                disabled={!editing}
                onChange={(event) => setBio(event.target.value)}
                rows={3}
                value={bio}
              />
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold text-stone-950">
            <Shield className="text-blue-600" size={18} />
            Segurança
          </h3>
          <div className="space-y-3">
            {['Senha atual', 'Nova senha', 'Confirmar nova senha'].map((label) => (
              <label key={label} className="block text-sm text-stone-600">
                <span className="mb-1.5 block">{label}</span>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10"
                  disabled={!editing}
                  placeholder="••••••••"
                  type="password"
                />
              </label>
            ))}
          </div>
        </section>

        {editing ? (
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 py-4 text-sm font-medium text-white" type="button">
            <Save size={16} />
            Salvar alteracoes
          </button>
        ) : null}
      </div>
    </DashboardShell>
  )
}
