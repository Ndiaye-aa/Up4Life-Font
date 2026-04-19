import type { UserRole } from '../../@types/auth'

interface RoleSegmentedControlProps {
  onChange: (role: UserRole) => void
  value: UserRole
}

const ROLE_LABELS: Record<UserRole, string> = {
  ALUNO: 'Aluno',
  PERSONAL: 'Personal',
}

export const RoleSegmentedControl = ({
  onChange,
  value,
}: RoleSegmentedControlProps) => (
  <div className="grid grid-cols-2 rounded-2xl bg-[#f3f4f6] p-1">
    {(['PERSONAL', 'ALUNO'] as UserRole[]).map((role) => {
      const isActive = role === value

      return (
        <button
          key={role}
          className={[
            'rounded-[1rem] px-4 py-3 text-sm font-medium transition',
            isActive
              ? 'bg-white text-stone-950 shadow-sm'
              : 'text-stone-500 hover:text-[#6d28d9]',
          ].join(' ')}
          onClick={() => onChange(role)}
          type="button"
        >
          {ROLE_LABELS[role]}
        </button>
      )
    })}
  </div>
)
