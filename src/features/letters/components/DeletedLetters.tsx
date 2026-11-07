import { RotateCcw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { LoveLetter, PartnerId } from '@/features/letters/types'

interface DeletedLettersProps {
  letters: LoveLetter[]
  currentPartnerId: PartnerId
  onRestore: (id: string) => void
}

export function DeletedLetters({
  letters,
  currentPartnerId,
  onRestore,
}: DeletedLettersProps) {
  if (letters.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface">
        <EmptyState
          title="No deleted letters"
          description="Restore a deleted letter."
          icon={<Trash2 aria-hidden="true" className="size-5" />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {letters.map((letter) => {
        const otherPartnerName =
          letter.senderId === currentPartnerId
            ? letter.recipientName
            : letter.senderName
        return (
          <article
            key={letter.id}
            className="flex items-center gap-3 rounded-card border border-border bg-card p-4 shadow-soft"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-text-secondary">
              {otherPartnerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-text-primary">
                {letter.title}
              </h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                {letter.status === 'draft'
                  ? 'Draft'
                  : `Letter with ${otherPartnerName}`}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onRestore(letter.id)}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Restore
            </Button>
          </article>
        )
      })}
    </div>
  )
}
