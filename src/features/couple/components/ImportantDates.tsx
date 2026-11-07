import { CalendarHeart, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { nextDateOccurrence } from '@/features/couple/date-utils'
import type { ImportantDate } from '@/features/couple/types'

const formatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function ImportantDates({
  dates,
  onAdd,
  onEdit,
  onDelete,
}: {
  dates: ImportantDate[]
  onAdd: () => void
  onEdit: (date: ImportantDate) => void
  onDelete: (date: ImportantDate) => void
}) {
  const upcoming = dates
    .map((item) => ({
      item,
      next: nextDateOccurrence(item.date, item.recurringAnnually),
    }))
    .filter((entry) => entry.next && entry.next.daysRemaining >= 0)
    .sort((a, b) => (a.next?.daysRemaining ?? 0) - (b.next?.daysRemaining ?? 0))
  return (
    <section aria-labelledby="dates-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="dates-title" className="text-lg font-semibold">
          Important Dates
        </h2>
        <Button size="sm" variant="secondary" onClick={onAdd}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {upcoming.map(({ item, next }) => (
          <article
            key={item.id}
            className="flex items-center gap-3 rounded-card border border-border bg-white p-4 shadow-soft"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-button">
              <CalendarHeart className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-xs text-text-secondary">
                {next ? formatter.format(next.date) : item.date} ·{' '}
                {next?.daysRemaining === 0
                  ? 'Today'
                  : `${next?.daysRemaining} days`}
              </p>
              {item.recurringAnnually ? (
                <p className="mt-1 text-[11px] text-text-muted">
                  Repeats yearly
                </p>
              ) : null}
            </div>
            {item.isCustom ? (
              <div className="flex">
                <button
                  onClick={() => onEdit(item)}
                  aria-label={`Edit ${item.title}`}
                  className="flex size-11 items-center justify-center text-text-secondary"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => onDelete(item)}
                  aria-label={`Delete ${item.title}`}
                  className="flex size-11 items-center justify-center text-primary"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
