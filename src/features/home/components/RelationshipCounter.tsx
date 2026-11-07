import { Clock3 } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { useRelationshipDuration } from '@/features/home/hooks/useRelationshipDuration'

interface RelationshipCounterProps {
  relationshipStartDate: string
}

export function RelationshipCounter({
  relationshipStartDate,
}: RelationshipCounterProps) {
  const duration = useRelationshipDuration(relationshipStartDate)

  if (duration.status !== 'active') {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-text-primary">
          Our time together
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {duration.status === 'future'
            ? 'The relationship counter will begin on the configured start date.'
            : 'Add a valid relationship start date to begin the counter.'}
        </p>
      </Card>
    )
  }

  return (
    <Card className="border-primary/15">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Together for
          </p>
          <p className="mt-1 tabular-nums">
            <span className="text-4xl leading-none font-semibold tracking-[-0.04em] text-text-primary">
              {duration.totalDays.toLocaleString()}
            </span>
            <span className="ml-2 text-sm font-medium text-text-secondary">
              days
            </span>
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Clock3 aria-hidden="true" className="size-5" />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 divide-x divide-border rounded-control bg-surface py-3 text-center">
        {[
          ['Years', duration.years],
          ['Months', duration.months],
          ['Days', duration.days],
        ].map(([label, value]) => (
          <div key={label}>
            <dd className="text-lg font-semibold tabular-nums text-text-primary">
              {value}
            </dd>
            <dt className="mt-0.5 text-[11px] font-medium text-text-muted">
              {label}
            </dt>
          </div>
        ))}
      </dl>

      <p
        aria-hidden="true"
        className="mt-3 text-center text-xs tabular-nums text-text-muted"
      >
        {String(duration.hours).padStart(2, '0')}h&nbsp;{' '}
        {String(duration.minutes).padStart(2, '0')}m&nbsp;{' '}
        {String(duration.seconds).padStart(2, '0')}s today
      </p>
    </Card>
  )
}
