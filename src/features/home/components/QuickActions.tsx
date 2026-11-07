import { CalendarDays, Heart, Plus } from 'lucide-react'
import { Link } from 'react-router'

interface QuickAction {
  label: string
  path: string
  icon: typeof Plus
}

const actions: QuickAction[] = [
  {
    label: 'Add Memory',
    path: '/timeline',
    icon: Plus,
  },
  {
    label: 'Write Letter',
    path: '/letters',
    icon: Heart,
  },
  {
    label: 'View Timeline',
    path: '/timeline',
    icon: CalendarDays,
  },
]

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-title">
      <h2
        id="quick-actions-title"
        className="text-lg font-semibold text-text-primary"
      >
        Quick actions
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {actions.map(({ label, path, icon: Icon }) => (
          <Link
            key={label}
            to={path}
            className="flex min-h-24 min-w-0 flex-col items-center justify-center rounded-card border border-border bg-card px-2 py-3 text-center shadow-soft transition-colors hover:bg-primary-soft/40 motion-reduce:transition-none"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-button">
              <Icon aria-hidden="true" className="size-[18px]" />
            </span>
            <span className="mt-2 text-xs font-semibold text-text-primary">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
