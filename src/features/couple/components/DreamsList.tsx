import {
  Check,
  Circle,
  Map,
  Pencil,
  Plus,
  Trash2,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { Dream, DreamCategory } from '@/features/couple/types'

const icons: Record<DreamCategory, LucideIcon> = {
  travel: Map,
  experiences: Circle,
  food: Utensils,
  personal_goals: Check,
  other: Circle,
}

export function DreamsList({
  dreams,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: {
  dreams: Dream[]
  onAdd: () => void
  onEdit: (dream: Dream) => void
  onToggle: (id: string) => void
  onDelete: (dream: Dream) => void
}) {
  const [filter, setFilter] = useState<'all' | 'planned' | 'completed'>('all')
  const visible = dreams.filter(
    (dream) =>
      filter === 'all' ||
      (filter === 'completed' ? dream.completed : !dream.completed),
  )
  const completed = dreams.filter((dream) => dream.completed).length

  return (
    <section aria-labelledby="dreams-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="dreams-title" className="text-lg font-semibold">
          Our Future Dreams
        </h2>
        <Button size="sm" variant="secondary" onClick={onAdd}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${dreams.length ? (completed / dreams.length) * 100 : 0}%`,
          }}
        />
      </div>
      <div className="mt-4 flex gap-2" role="group" aria-label="Filter dreams">
        {(['all', 'planned', 'completed'] as const).map((item) => (
          <button
            key={item}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold capitalize ${filter === item ? 'border-border-strong bg-primary text-white' : 'border-border-strong bg-card text-text-secondary'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {visible.map((dream) => {
          const Icon = icons[dream.category]
          return (
            <article
              key={dream.id}
              className={`rounded-card border p-4 shadow-soft ${dream.completed ? 'border-border bg-surface' : 'border-border bg-card'}`}
            >
              <div className="flex gap-3">
                <button
                  onClick={() => onToggle(dream.id)}
                  aria-label={
                    dream.completed
                      ? `Mark ${dream.title} planned`
                      : `Mark ${dream.title} completed`
                  }
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-button"
                >
                  {dream.completed ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm font-semibold ${dream.completed ? 'text-text-secondary line-through' : ''}`}
                  >
                    {dream.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    {dream.description}
                  </p>
                  {dream.targetDate ? (
                    <p className="mt-2 text-[11px] text-text-muted">
                      Target: {dream.targetDate}
                    </p>
                  ) : null}
                </div>
                <div className="flex">
                  <button
                    aria-label={`Edit ${dream.title}`}
                    onClick={() => onEdit(dream)}
                    className="flex size-11 items-center justify-center text-text-secondary"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    aria-label={`Delete ${dream.title}`}
                    onClick={() => onDelete(dream)}
                    className="flex size-11 items-center justify-center text-primary"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
