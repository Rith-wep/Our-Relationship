import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'
import type { TimelineMemory } from '@/features/timeline/types'

interface PhotoViewerProps {
  memory: TimelineMemory | null
  onClose: () => void
}

export function PhotoViewer({ memory, onClose }: PhotoViewerProps) {
  return (
    <MemoryDialog
      open={Boolean(memory?.photo)}
      title={memory?.title ?? 'Memory photo'}
      description="Full-screen photo preview"
      onClose={onClose}
      size="viewer"
    >
      {memory?.photo ? (
        <figure className="flex h-full min-h-dvh flex-col items-center justify-center bg-black p-4 sm:min-h-0 sm:p-8">
          <img
            src={memory.photo.src}
            alt={memory.photo.alt}
            className="max-h-[80dvh] max-w-full object-contain"
          />
          <figcaption className="mt-4 max-w-xl text-center text-sm font-medium text-white/85">
            {memory.title}
          </figcaption>
        </figure>
      ) : null}
    </MemoryDialog>
  )
}
