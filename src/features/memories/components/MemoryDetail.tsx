import { CalendarDays, Heart, Pencil, Trash2, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'
import type { MilestoneType, TimelineMemory } from '@/features/timeline/types'

interface MemoryDetailProps {
  memory: TimelineMemory | null
  onClose: () => void
  onEdit: (memory: TimelineMemory) => void
  onDelete: (memory: TimelineMemory) => void
  onToggleFavorite: (id: string) => void
}

const milestoneLabels: Record<MilestoneType, string> = {
  first_meeting: 'First meeting',
  first_conversation: 'First conversation',
  first_date: 'First date',
  relationship_started: 'Relationship started',
  anniversary: 'Anniversary',
  special_memory: 'Special memory',
  custom_event: 'Custom event',
}

const detailDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function MemoryDetail({
  memory,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}: MemoryDetailProps) {
  return (
    <MemoryDialog
      open={Boolean(memory)}
      title={memory?.title ?? 'Memory details'}
      description="Memory details and actions"
      onClose={onClose}
      size="detail"
    >
      {memory ? (
        <div className="flex h-[calc(100%-4.75rem)] flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {memory.media[0] ? (
              memory.media[0].mediaType === 'video' ? (
                <video
                  src={memory.media[0].src}
                  controls
                  playsInline
                  className="aspect-[4/3] w-full bg-surface object-contain"
                />
              ) : (
                <img
                  src={memory.media[0].src}
                  alt={memory.media[0].alt}
                  className="aspect-[4/3] w-full bg-surface object-cover"
                />
              )
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-primary-soft text-primary">
                <CalendarDays aria-hidden="true" className="size-8" />
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    {milestoneLabels[memory.milestoneType]}
                  </p>
                  <h3 className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.02em] text-text-primary">
                    {memory.title}
                  </h3>
                </div>
                <IconButton
                  label={
                    memory.isFavorite
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                  aria-pressed={memory.isFavorite}
                  onClick={() => onToggleFavorite(memory.id)}
                  className={
                    memory.isFavorite ? 'bg-primary-soft text-primary' : ''
                  }
                >
                  <Heart
                    aria-hidden="true"
                    className={`size-5 ${memory.isFavorite ? 'fill-current' : ''}`}
                  />
                </IconButton>
              </div>

              <dl className="mt-5 grid gap-3 rounded-card bg-surface p-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  <dt className="sr-only">Date</dt>
                  <dd className="text-text-secondary">
                    {detailDateFormatter.format(
                      new Date(`${memory.date}T00:00:00.000Z`),
                    )}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <UserRound
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  <dt className="sr-only">Created by</dt>
                  <dd className="text-text-secondary">
                    Added by {memory.createdBy}
                  </dd>
                </div>
              </dl>

              {memory.description ? (
                <p className="mt-5 text-[15px] leading-7 text-text-secondary">
                  {memory.description}
                </p>
              ) : (
                <p className="mt-5 text-sm text-text-muted">
                  No description was added.
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-border bg-card px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => onEdit(memory)}
            >
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => onDelete(memory)}
              className="text-primary hover:bg-primary-soft hover:text-primary-strong"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </MemoryDialog>
  )
}
