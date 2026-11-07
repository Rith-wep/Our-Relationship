import { CalendarHeart } from 'lucide-react'
import { useMemo } from 'react'

import { Card } from '@/components/ui/Card'
import { calculateAnniversaries } from '@/features/home/hooks/useRelationshipDuration'

interface AnniversaryCardProps {
  relationshipStartDate: string
}

const anniversaryFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
})

export function AnniversaryCard({
  relationshipStartDate,
}: AnniversaryCardProps) {
  const anniversary = useMemo(
    () => calculateAnniversaries(relationshipStartDate),
    [relationshipStartDate],
  )

  if (!anniversary) return null

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <CalendarHeart aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">
            Next monthly anniversary
          </p>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-lg font-semibold text-text-primary">
              {anniversaryFormatter.format(anniversary.monthlyDate)}
            </h2>
            <span className="text-sm font-semibold text-primary">
              {anniversary.monthlyDaysRemaining === 0
                ? 'Today'
                : `${anniversary.monthlyDaysRemaining} days`}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-text-secondary">
            Yearly anniversary:{' '}
            {anniversaryFormatter.format(anniversary.yearlyDate)} ·{' '}
            {anniversary.yearlyDaysRemaining === 0
              ? 'today'
              : `${anniversary.yearlyDaysRemaining} days away`}
          </p>
        </div>
      </div>
    </Card>
  )
}
