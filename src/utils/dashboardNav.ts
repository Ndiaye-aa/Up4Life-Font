import {
  Activity,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  UserCircle,
  Users,
} from 'lucide-react'
import type { UserRole } from '../@types/auth'
import type { DashboardNavItem } from '../components/layout/DashboardShell'

export const getDashboardNavItems = (role: UserRole): DashboardNavItem[] => {
  if (role === 'PERSONAL') {
    const base = '/dashboard/admin'
    return [
      { icon: LayoutDashboard, label: 'Home', to: base },
      { icon: Users, label: 'Alunos', to: `${base}/alunos` },
      { icon: Dumbbell, label: 'Treinos', to: `${base}/treinos` },
      { icon: ClipboardList, label: 'Avaliações', to: `${base}/avaliacoes` },
      { icon: UserCircle, label: 'Perfil', to: `${base}/perfil` },
    ]
  }

  const base = '/dashboard/aluno'
  return [
    { icon: LayoutDashboard, label: 'Home', to: base },
    { icon: Dumbbell, label: 'Treinos', to: `${base}/treinos` },
    { icon: Activity, label: 'Progresso', to: `${base}/progresso` },
    { icon: ClipboardList, label: 'Avaliações', to: `${base}/avaliacoes` },
  ]
}
