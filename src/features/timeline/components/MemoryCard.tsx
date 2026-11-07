import { Heart, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import type { TimelineMemory } from '@/features/timeline/types'

interface MemoryCardProps {
  memory: TimelineMemory
  onEdit: (memory: TimelineMemory) => void
  onDelete: (memory: TimelineMemory) => void
  onViewPhoto: (memory: TimelineMemory) => void
}

const collapsedDescriptionLength = 145

export function MemoryCard({
  memory,
  onEdit,
  onDelete,
  onViewPhoto,
}: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = memory.description.length > collapsedDescriptionLength
  const description =
    isLong && !expanded
      ? `${memory.description.slice(0, collapsedDescriptionLength).trimEnd()}…`
      : memory.description
  const isFeatured = ['relationship_started', 'anniversary'].includes(
    memory.milestoneType,
  )

  return (
    <Card
      padding="none"
      className={
        isFeatured
          ? 'border-primary/20 shadow-[0_8px_28px_rgb(244_63_94/0.10)]'
          : ''
      }
    >
      {memory.photo ? (
        <button
          type="button"
          onClick={() => onViewPhoto(memory)}
          aria-label={`Open photo for ${memory.title}`}
          className="block w-full overflow-hidden rounded-t-[calc(var(--radius-card)-1px)] bg-surface"
        >
          <img
            src={memory.photo.src}
            alt={memory.photo.alt}
            className="aspect-[16/10] w-full object-cover transition-transform duration-200 hover:scale-[1.01] motion-reduce:transition-none"
          />
        </button>
      ) : null}

      <div className="p-4">
        <div className="flex items-start gap-2">
          <h2 className="min-w-0 flex-1 text-[17px] leading-6 font-semibold text-text-primary">
            {memory.title}
          </h2>
          <div className="-mt-2 -mr-2 flex shrink-0">
            {memory.isFavorite ? (
              <span
                className="flex size-11 items-center justify-center text-primary"
                aria-label="Favorite memory"
              >
                <Heart
                  aria-hidden="true"
                  className="size-[18px] fill-current"
                />
              </span>
            ) : null}
            <IconButton
              label={`Edit ${memory.title}`}
              onClick={() => onEdit(memory)}
            >
              <Pencil aria-hidden="true" className="size-[18px]" />
            </IconButton>
            <IconButton
              label={`Delete ${memory.title}`}
              onClick={() => onDelete(memory)}
              className="hover:bg-primary-soft hover:text-primary"
            >
              <Trash2 aria-hidden="true" className="size-[18px]" />
            </IconButton>
          </div>
        </div>

        {memory.description ? (
          <div className="mt-2">
            <p className="text-sm leading-6 text-text-secondary">
              {description}
            </p>
            {isLong ? (
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-expanded={expanded}
                className="mt-1 min-h-11 rounded-md text-sm font-semibold text-primary hover:text-primary-strong"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            ) : null}
          </div>
        ) : null}

        <p className="mt-3 text-xs text-text-muted">
          Added by {memory.createdBy}
        </p>
      </div>
    </Card>
  )
}
