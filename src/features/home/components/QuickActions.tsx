import { CalendarDays, Heart, Plus } from 'lucide-react'
import { Link } from 'react-router'

interface QuickAction {
  label: string
  helper: string
  path: string
  icon: typeof Plus
}

const actions: QuickAction[] = [
  {
    label: 'Add Memory',
    helper: 'Opens Timeline',
    path: '/timeline',
    icon: Plus,
  },
  {
    label: 'Write Letter',
    helper: 'Coming later',
    path: '/letters',
    icon: Heart,
  },
  {
    label: 'View Timeline',
    helper: 'See our story',
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
        {actions.map(({ label, helper, path, icon: Icon }) => (
          <Link
            key={label}
            to={path}
            className="flex min-h-28 min-w-0 flex-col items-center justify-center rounded-card border border-border bg-background px-2 py-3 text-center shadow-soft transition-colors hover:border-primary/25 hover:bg-primary-soft/40 motion-reduce:transition-none"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon aria-hidden="true" className="size-[18px]" />
            </span>
            <span className="mt-2 text-xs font-semibold text-text-primary">
              {label}
            </span>
            <span className="mt-0.5 text-[10px] leading-4 text-text-muted">
              {helper}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
