import { ArrowLeft, Heart, Pencil, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import type { LoveLetter, PartnerId } from '@/features/letters/types'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'

interface LetterReaderProps {
  letter: LoveLetter | null
  currentPartnerId: PartnerId
  onClose: () => void
  onFavorite: (letter: LoveLetter) => void
  onDelete: (letter: LoveLetter) => void
  onEdit: (letter: LoveLetter) => void
}

const readerDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function LetterReader({
  letter,
  currentPartnerId,
  onClose,
  onFavorite,
  onDelete,
  onEdit,
}: LetterReaderProps) {
  const canEdit =
    letter?.status === 'draft' && letter.senderId === currentPartnerId
  const displayDate = letter?.sentAt ?? letter?.updatedAt

  return (
    <MemoryDialog
      open={Boolean(letter)}
      title={letter?.title ?? 'Love letter'}
      description="Private letter reading view"
      onClose={onClose}
      size="letter"
    >
      {letter && displayDate ? (
        <article className="flex h-full flex-col bg-card">
          <div className="flex shrink-0 items-center justify-between border-b border-amber-900/5 px-3 py-2">
            <IconButton label="Back to letters" onClick={onClose}>
              <ArrowLeft aria-hidden="true" className="size-5" />
            </IconButton>
            <div className="flex">
              {canEdit ? (
                <IconButton label="Edit draft" onClick={() => onEdit(letter)}>
                  <Pencil aria-hidden="true" className="size-5" />
                </IconButton>
              ) : null}
              <IconButton
                label={
                  letter.favorite ? 'Remove from favorites' : 'Add to favorites'
                }
                aria-pressed={letter.favorite}
                onClick={() => onFavorite(letter)}
                className={letter.favorite ? 'text-primary' : ''}
              >
                <Heart
                  aria-hidden="true"
                  className={`size-5 ${letter.favorite ? 'fill-current' : ''}`}
                />
              </IconButton>
              <IconButton
                label="Delete letter"
                onClick={() => onDelete(letter)}
                className="hover:bg-primary-soft hover:text-primary"
              >
                <Trash2 aria-hidden="true" className="size-5" />
              </IconButton>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 min-[380px]:px-8">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              {letter.status === 'draft'
                ? 'Unsent draft'
                : `For ${letter.recipientName}`}
            </p>
            <h2 className="mt-3 font-serif text-[1.75rem] leading-9 font-semibold tracking-[-0.02em] text-stone-900">
              {letter.title}
            </h2>
            <time
              dateTime={displayDate}
              className="mt-2 block text-xs text-stone-500"
            >
              {readerDateFormatter.format(new Date(displayDate))}
            </time>

            <div className="mt-8 space-y-5 font-serif text-[17px] leading-8 text-stone-700">
              {letter.body ? (
                letter.body
                  .split(/\n\s*\n/)
                  .map((paragraph, index) => (
                    <p key={`${letter.id}-${index}`}>{paragraph}</p>
                  ))
              ) : (
                <p className="italic text-stone-400">
                  This draft is waiting for your words.
                </p>
              )}
            </div>

            <footer className="mt-10 border-t border-amber-900/10 pt-6 font-serif text-stone-700">
              <p className="text-sm">With love,</p>
              <p className="mt-1 text-lg font-semibold">{letter.senderName}</p>
            </footer>
          </div>
        </article>
      ) : null}
    </MemoryDialog>
  )
}
