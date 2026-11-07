import { CalendarDays } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TimelineItem } from '@/features/timeline/components/TimelineItem'
import type { TimelineMemory } from '@/features/timeline/types'

interface TimelineListProps {
  memories: TimelineMemory[]
  onAdd: () => void
  onEdit: (memory: TimelineMemory) => void
  onDelete: (memory: TimelineMemory) => void
  onViewPhoto: (memory: TimelineMemory) => void
}

export function TimelineList({
  memories,
  onAdd,
  onEdit,
  onDelete,
  onViewPhoto,
}: TimelineListProps) {
  if (memories.length === 0) {
    return (
      <div className="mt-10 rounded-card border border-border bg-surface">
        <EmptyState
          title="Your story starts here"
          description="Add your first memory."
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
          action={<Button onClick={onAdd}>Add first memory</Button>}
        />
      </div>
    )
  }

  return (
    <ol className="relative mt-7 before:absolute before:top-4 before:bottom-5 before:left-[15px] before:w-0.5 before:rounded-full before:bg-text-primary/25 before:content-['']">
      {memories.map((memory) => (
        <TimelineItem
          key={memory.id}
          memory={memory}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewPhoto={onViewPhoto}
        />
      ))}
    </ol>
  )
}
