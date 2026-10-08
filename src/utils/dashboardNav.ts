import {
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  UserCircle,
  Users,
} from 'lucide-react'
import type { DashboardNavItem } from '../components/layout/DashboardShell'

const BASE_PATH = '/dashboard/admin'

export const getDashboardNavItems = (): DashboardNavItem[] => [
  {
    icon: LayoutDashboard,
    label: 'Home',
    to: BASE_PATH,
  },
  {
    icon: Users,
    label: 'Alunos',
    to: `${BASE_PATH}/alunos`,
  },
  {
    icon: Dumbbell,
    label: 'Treinos',
    to: `${BASE_PATH}/treinos`,
  },
  {
    icon: ClipboardList,
    label: 'Avaliações',
    to: `${BASE_PATH}/avaliacoes`,
  },
  {
    icon: UserCircle,
    label: 'Perfil',
    to: `${BASE_PATH}/perfil`,
  },
]
