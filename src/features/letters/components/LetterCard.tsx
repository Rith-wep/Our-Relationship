import { FilePenLine, Heart } from 'lucide-react'

import { getPartner } from '@/features/letters/data/demoLetters'
import type { LetterBox } from '@/features/letters/view-types'
import type { LoveLetter } from '@/features/letters/types'

interface LetterCardProps {
  letter: LoveLetter
  box: LetterBox
  onOpen: (letter: LoveLetter) => void
}

const cardDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function previewBody(body: string) {
  const normalized = body.replace(/\s+/g, ' ').trim()
  return normalized || 'No words added yet.'
}

export function LetterCard({ letter, box, onOpen }: LetterCardProps) {
  const sender = getPartner(letter.senderId)
  const recipient = getPartner(letter.recipientId)
  const unread = box === 'inbox' && !letter.readAt
  const displayDate = letter.sentAt ?? letter.updatedAt

  return (
    <button
      type="button"
      onClick={() => onOpen(letter)}
      className={[
        'w-full rounded-card border bg-background p-4 text-left shadow-soft transition-colors motion-reduce:transition-none',
        unread
          ? 'border-primary/25'
          : 'border-border hover:border-border-strong',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            unread ? 'bg-primary text-white' : 'bg-primary-soft text-primary',
          ].join(' ')}
        >
          {box === 'drafts' ? (
            <FilePenLine aria-hidden="true" className="size-[18px]" />
          ) : (
            sender?.initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`truncate text-xs ${unread ? 'font-semibold text-primary' : 'text-text-secondary'}`}
            >
              {box === 'inbox'
                ? `From ${sender?.name ?? 'Partner'}`
                : `To ${recipient?.name ?? 'Partner'}`}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              {letter.favorite ? (
                <Heart
                  aria-label="Favorite"
                  className="size-3.5 fill-current text-primary"
                />
              ) : null}
              <time
                dateTime={displayDate}
                className="text-[11px] text-text-muted"
              >
                {cardDateFormatter.format(new Date(displayDate))}
              </time>
            </div>
          </div>
          <h2
            className={`mt-1 truncate text-[15px] ${unread ? 'font-bold' : 'font-semibold'} text-text-primary`}
          >
            {letter.title || 'Untitled letter'}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-secondary">
            {previewBody(letter.body)}
          </p>
          {unread ? (
            <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Unread
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}
