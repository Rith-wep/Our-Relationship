import {
  CalendarHeart,
  CakeSlice,
  Coffee,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

import { MemoryCard } from '@/features/timeline/components/MemoryCard'
import type { MilestoneType, TimelineMemory } from '@/features/timeline/types'

interface TimelineItemProps {
  memory: TimelineMemory
  onEdit: (memory: TimelineMemory) => void
  onDelete: (memory: TimelineMemory) => void
  onViewPhoto: (memory: TimelineMemory) => void
}

const milestoneIcons: Record<MilestoneType, LucideIcon> = {
  first_meeting: MapPin,
  first_conversation: MessageCircle,
  first_date: Coffee,
  relationship_started: HeartHandshake,
  anniversary: CakeSlice,
  special_memory: Sparkles,
  custom_event: CalendarHeart,
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

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatMemoryDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00.000Z`))
}

export function TimelineItem({
  memory,
  onEdit,
  onDelete,
  onViewPhoto,
}: TimelineItemProps) {
  const Icon = milestoneIcons[memory.milestoneType]

  return (
    <li className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-8 last:pb-2">
      <div className="relative z-10 flex size-8 items-center justify-center rounded-full border-[3px] border-primary-soft bg-primary text-white shadow-[0_0_0_4px_white]">
        <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
      </div>

      <div className="min-w-0 pt-0.5">
        <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <time
            dateTime={memory.date}
            className="text-xs font-semibold tracking-wide text-primary uppercase"
          >
            {formatMemoryDate(memory.date)}
          </time>
          <span
            aria-hidden="true"
            className="size-1 rounded-full bg-border-strong"
          />
          <span className="text-xs text-text-secondary">
            {milestoneLabels[memory.milestoneType]}
          </span>
        </div>
        <MemoryCard
          memory={memory}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewPhoto={onViewPhoto}
        />
      </div>
    </li>
  )
}
