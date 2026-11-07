import { CalendarDays, Info, LockKeyhole, MapPin, Pencil } from 'lucide-react'

import { ThemeToggle } from '@/components/layout/ThemeToggle'

export function CoupleSettings({
  onEdit,
  onConnection,
}: {
  onEdit: () => void
  onConnection: () => void
}) {
  const items = [
    {
      label: 'Edit Couple Profile',
      icon: Pencil,
      action: onEdit,
    },
    {
      label: 'Relationship Start Date',
      icon: CalendarDays,
      action: onEdit,
    },
    {
      label: 'Distance & time',
      icon: MapPin,
      action: onConnection,
    },
    {
      label: 'App Information',
      icon: Info,
    },
    {
      label: 'Privacy Information',
      icon: LockKeyhole,
    },
  ]
  return (
    <section aria-labelledby="settings-title">
      <h2 id="settings-title" className="text-lg font-semibold">
        Settings
      </h2>
      <div className="mt-3 overflow-hidden rounded-card border border-border bg-card shadow-soft">
        <ThemeToggle variant="setting" />
        {items.map(({ label, icon: Icon, action }) => {
          const content = (
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-button">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{label}</span>
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
    </section>
  )
}
