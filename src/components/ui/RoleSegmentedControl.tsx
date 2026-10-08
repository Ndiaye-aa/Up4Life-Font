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
  <div className="grid grid-cols-2 rounded-2xl bg-elev p-1">
    {(['PERSONAL', 'ALUNO'] as UserRole[]).map((role) => {
      const isActive = role === value

      return (
        <button
          key={role}
          className={[
            'rounded-[1rem] px-4 py-3 text-sm font-medium transition',
            isActive
              ? 'bg-surface text-ink shadow-sm'
              : 'text-mute hover:text-accent',
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
