import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'
import type { TimelineMemory } from '@/features/timeline/types'

interface PhotoViewerProps {
  memory: TimelineMemory | null
  onClose: () => void
}

export function PhotoViewer({ memory, onClose }: PhotoViewerProps) {
  const media = memory?.media[0]
  return (
    <MemoryDialog
      open={Boolean(media)}
      title={memory?.title ?? 'Memory photo'}
      description="Full-screen photo preview"
      onClose={onClose}
      size="viewer"
    >
      {media ? (
        <figure className="flex h-full min-h-dvh flex-col items-center justify-center bg-dark p-4 text-on-dark sm:min-h-0 sm:p-8">
          {media.mediaType === 'video' ? (
            <video
              src={media.src}
              controls
              playsInline
              className="max-h-[80dvh] max-w-full"
            />
          ) : (
            <img
              src={media.src}
              alt={media.alt}
              className="max-h-[80dvh] max-w-full object-contain"
            />
          )}
          <figcaption className="mt-4 max-w-xl text-center text-sm font-medium text-white/85">
            {memory?.title}
          </figcaption>
        </figure>
      ) : null}
    </MemoryDialog>
  )
}
