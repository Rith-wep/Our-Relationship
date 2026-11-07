import { RotateCcw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { TimelineMemory } from '@/features/timeline/types'

interface RecentlyDeletedProps {
  memories: TimelineMemory[]
  onRestore: (id: string) => void
  onPermanentlyDelete: (memory: TimelineMemory) => void
}

export function RecentlyDeleted({
  memories,
  onRestore,
  onPermanentlyDelete,
}: RecentlyDeletedProps) {
  if (memories.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface">
        <EmptyState
          title="Recently Deleted is empty"
          description="Restore a deleted memory."
          icon={<Trash2 aria-hidden="true" className="size-5" />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-text-secondary">
        Restore or remove memories.
      </p>
      {memories.map((memory) => (
        <article
          key={memory.id}
          className="flex gap-3 rounded-card border border-border bg-card p-3 shadow-soft"
        >
          {memory.photo ? (
            <img
              src={memory.photo.src}
              alt=""
              loading="lazy"
              className="size-20 shrink-0 rounded-control object-cover opacity-75"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-control bg-surface text-text-muted">
              <Trash2 aria-hidden="true" className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {memory.title}
            </h3>
            <p className="mt-1 text-xs text-text-secondary">Recently deleted</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onRestore(memory.id)}
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Restore
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPermanentlyDelete(memory)}
                className="text-primary hover:bg-primary-soft hover:text-primary-strong"
              >
                Remove
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
