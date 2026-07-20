import { Bell, Calendar, Camera, KeyRound, Pencil, Phone, Target, User, UserPen } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardShell } from '../components/layout/DashboardShell'
import { ChangePasswordModal } from '../components/modules/admin/ChangePasswordModal'
import { EditPersonalDataModal } from '../components/modules/admin/EditPersonalDataModal'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { updateStudentSelfService } from '../services/students'
import { getStudentWorkoutsService } from '../services/workouts'
import { getStudentAssessmentsService } from '../services/assessments'
import { formatPhone } from '../utils/formatPhone'

export const StudentProfilePage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<'data' | 'password' | null>(null)
  const [counts, setCounts] = useState({ treinos: 0, avaliacoes: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user?.id) return
    Promise.all([getStudentWorkoutsService(user.id), getStudentAssessmentsService(user.id)])
      .then(([workouts, assessments]) => {
        setCounts({ treinos: workouts.length, avaliacoes: assessments.length })
      })
      .catch(() => setCounts({ treinos: 0, avaliacoes: 0 }))
  }, [user?.id])

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const openModal = (modal: 'data' | 'password') => {
    setMenuOpen(false)
    setActiveModal(modal)
  }

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
        { label: 'Treinos', value: String(counts.treinos) },
        { label: 'Aval.', value: String(counts.avaliacoes) },
      ]}
      roleLabel="Aluno"
      tone="student"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <PageHeader
          description=""
          eyebrow="Perfil"
          title=""
        />

        <div className=" divide-y divide-line rounded-[2rem]">
          <section className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative" ref={menuRef}>
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-2xl text-white">
                  {user?.name?.charAt(0)}
                </div>
                <button
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Editar perfil"
                  className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent-strong text-white shadow-lg transition hover:brightness-110"
                  onClick={() => setMenuOpen((open) => !open)}
                  type="button"
                >
                  <Pencil size={13} />
                </button>

                {menuOpen ? (
                  <div
                    className="absolute left-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl"
                    role="menu"
                  >
                    <button
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-ink transition hover:bg-elev"
                      onClick={() => openModal('data')}
                      role="menuitem"
                      type="button"
                    >
                      <UserPen className="text-mute" size={15} />
                      Dados pessoais
                    </button>
                    <button
                      className="flex w-full cursor-not-allowed items-center gap-2.5 px-4 py-3 text-left text-sm text-ink opacity-50"
                      disabled
                      role="menuitem"
                      type="button"
                    >
                      <Camera className="text-mute" size={15} />
                      Alterar foto de perfil
                      <span className="ml-auto whitespace-nowrap rounded-full bg-elev px-2 py-0.5 text-[10px] uppercase tracking-wide text-faint">
                        Em breve
                      </span>
                    </button>
                    <button
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-ink transition hover:bg-elev"
                      onClick={() => openModal('password')}
                      role="menuitem"
                      type="button"
                    >
                      <KeyRound className="text-mute" size={15} />
                      Alterar senha
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold text-ink">{user?.name}</h2>
                <p className="truncate text-sm text-mute">{formatPhone(user?.phone ?? '')}</p>
                <span className="mt-2 inline-block rounded-full bg-blue-500/12 px-3 py-1 text-xs text-blue-400 light:bg-blue-50 light:text-blue-600">
                  Aluno
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {activeModal === 'data' ? (
        <EditPersonalDataModal
          onClose={() => setActiveModal(null)}
          updateSelf={updateStudentSelfService}
        />
      ) : null}
      {activeModal === 'password' ? (
        <ChangePasswordModal
          onClose={() => setActiveModal(null)}
          updateSelf={updateStudentSelfService}
        />
      ) : null}
    </DashboardShell>
  )
}
