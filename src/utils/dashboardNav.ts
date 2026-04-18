import {
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  UserCircle,
} from 'lucide-react'
import type { UserRole } from '../@types/auth'
import type { DashboardNavItem } from '../components/layout/DashboardShell'

export const getDashboardNavItems = (role: UserRole): DashboardNavItem[] => {
  const basePath =
    role === 'PERSONAL' ? '/dashboard/admin' : '/dashboard/aluno'

  return [
    {
      icon: LayoutDashboard,
      label: 'Home',
      to: basePath,
    },
    {
      icon: Dumbbell,
      label: 'Treinos',
      to: `${basePath}/treinos`,
    },
    {
      icon: ClipboardList,
      label: 'Avaliações',
      to: `${basePath}/avaliacoes`,
    },
    {
      icon: UserCircle,
      label: 'Perfil',
      to: `${basePath}/perfil`,
    },
  ]
}
