import { CalendarDays, Info, LockKeyhole, Pencil } from 'lucide-react'

export function CoupleSettings({
  startDate,
  onEdit,
}: {
  startDate: string
  onEdit: () => void
}) {
  const items = [
    {
      label: 'Edit Couple Profile',
      detail: 'Names, photos, and description',
      icon: Pencil,
      action: onEdit,
    },
    {
      label: 'Relationship Start Date',
      detail: startDate,
      icon: CalendarDays,
      action: onEdit,
    },
    {
      label: 'App Information',
      detail: 'Our Little Universe · Local preview',
      icon: Info,
    },
    {
      label: 'Privacy Information',
      detail: 'Session-only demo data; Supabase privacy controls planned',
      icon: LockKeyhole,
    },
  ]
  return (
    <section aria-labelledby="settings-title">
      <h2 id="settings-title" className="text-lg font-semibold">
        Settings
      </h2>
      <div className="mt-3 overflow-hidden rounded-card border border-border bg-white shadow-soft">
        {items.map(({ label, detail, icon: Icon, action }) => {
          const content = (
            <>
              <Icon className="size-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-text-secondary">
                  {detail}
                </span>
              </span>
            </>
          )
          return action ? (
            <button
              key={label}
              onClick={action}
              className="flex min-h-16 w-full items-center gap-3 border-b border-border px-4 text-left last:border-0"
            >
              {content}
            </button>
          ) : (
            <div
              key={label}
              className="flex min-h-16 items-center gap-3 border-b border-border px-4 last:border-0"
            >
              {content}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-text-muted">
        Authentication, notifications, account management, and cloud privacy
        controls are planned features.
      </p>
    </section>
  )
}
