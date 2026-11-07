import { MessageCircleHeart, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { loveNotes } from '@/features/home/data/loveNotes'

function localDateKey(date: Date) {
  return date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate()
}

export function DailyLoveNote() {
  const [noteOffset, setNoteOffset] = useState(0)
  const dailyIndex = useMemo(
    () => localDateKey(new Date()) % loveNotes.length,
    [],
  )
  const note = loveNotes[(dailyIndex + noteOffset) % loveNotes.length]

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <MessageCircleHeart aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                A note for today
              </p>
              <h2 className="sr-only">Daily love note</h2>
            </div>
            <IconButton
              label="Show another love note"
              onClick={() =>
                setNoteOffset((current) => (current + 1) % loveNotes.length)
              }
              className="-mt-2 -mr-2"
            >
              <RefreshCw aria-hidden="true" className="size-[18px]" />
            </IconButton>
          </div>
          <blockquote className="mt-2 text-[15px] leading-6 font-medium text-text-primary">
            “{note}”
          </blockquote>
        </div>
      </div>
    </Card>
  )
}
