import { CalendarDays, Heart, ImageOff } from 'lucide-react'

import type { TimelineMemory } from '@/features/timeline/types'

interface GalleryCardProps {
  memory: TimelineMemory
  onOpen: (memory: TimelineMemory) => void
}

const galleryDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function GalleryCard({ memory, onOpen }: GalleryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(memory)}
      aria-label={`Open ${memory.title}`}
      className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-card border border-border bg-card text-left shadow-soft transition-colors hover:border-border-strong motion-reduce:transition-none"
    >
      <div className="relative overflow-hidden bg-surface">
        {memory.media[0] ? (
          memory.media[0].mediaType === 'video' ? (
            <video
              src={memory.media[0].src}
              muted
              playsInline
              preload="metadata"
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <img
              src={memory.media[0].src}
              alt={memory.media[0].alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-[1.015] motion-reduce:transition-none"
            />
          )
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-primary-soft text-primary">
            <ImageOff aria-hidden="true" className="size-6" />
          </div>
        )}
        {memory.isFavorite ? (
          <span
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-button"
            aria-label="Favorite"
          >
            <Heart aria-hidden="true" className="size-4 fill-current" />
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <h2 className="line-clamp-2 text-sm leading-5 font-semibold text-text-primary">
          {memory.title}
        </h2>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-text-secondary">
          <CalendarDays aria-hidden="true" className="size-3" />
          <time dateTime={memory.date}>
            {galleryDateFormatter.format(
              new Date(`${memory.date}T00:00:00.000Z`),
            )}
          </time>
        </div>
      </div>
    </button>
  )
}
