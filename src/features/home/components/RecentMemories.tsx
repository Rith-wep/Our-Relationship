import { ArrowRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router'

import type { TimelineMemory } from '@/features/timeline/types'

interface RecentMemoriesProps {
  memories: TimelineMemory[]
}

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function RecentMemories({ memories }: RecentMemoriesProps) {
  const recentMemories = [...memories]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 3)

  return (
    <section aria-labelledby="recent-memories-title">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="recent-memories-title"
          className="text-lg font-semibold text-text-primary"
        >
          Recent memories
        </h2>
        <Link
          to="/timeline"
          className="flex min-h-11 shrink-0 items-center gap-1 rounded-control px-2 text-sm font-semibold text-primary hover:text-primary-strong"
        >
          See all
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        {recentMemories.length === 0 ? (
          <p className="rounded-card border border-border bg-surface px-4 py-6 text-center text-sm text-text-secondary">
            No shared memories yet. Add one from Timeline or Memories.
          </p>
        ) : null}
        {recentMemories.map((memory) => (
          <Link
            key={memory.id}
            to="/timeline"
            aria-label={`View ${memory.title} in Timeline`}
            className="flex min-h-24 overflow-hidden rounded-card border border-border bg-card shadow-soft transition-colors hover:border-border-strong motion-reduce:transition-none"
          >
            {memory.photo ? (
              <img
                src={memory.photo.src}
                alt=""
                className="aspect-square w-24 shrink-0 object-cover"
              />
            ) : (
              <div className="flex w-24 shrink-0 items-center justify-center bg-primary-soft text-primary">
                <CalendarDays aria-hidden="true" className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1 self-center p-3.5">
              <p className="truncate text-sm font-semibold text-text-primary">
                {memory.title}
              </p>
              <time
                dateTime={memory.date}
                className="mt-1 block text-xs text-text-secondary"
              >
                {shortDateFormatter.format(
                  new Date(`${memory.date}T00:00:00.000Z`),
                )}
              </time>
            </div>
            <ArrowRight
              aria-hidden="true"
              className="mr-3 size-4 shrink-0 self-center text-text-muted"
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
