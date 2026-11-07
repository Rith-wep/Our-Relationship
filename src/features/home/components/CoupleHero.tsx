import { CalendarDays } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import type { CoupleProfile } from '@/features/couple/types'

interface CoupleHeroProps {
  couple: CoupleProfile
}

const startDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function CoupleHero({ couple }: CoupleHeroProps) {
  const startDate = couple.relationshipStartDate
    ? new Date(`${couple.relationshipStartDate}T00:00:00.000Z`)
    : null
  const formattedStartDate =
    startDate && !Number.isNaN(startDate.getTime())
      ? startDateFormatter.format(startDate)
      : null

  return (
    <Card className="overflow-hidden border-border bg-primary-soft/55 p-0">
      <div className="flex flex-col items-center px-5 py-6 text-center">
        <div
          className="flex -space-x-3"
          aria-label={`${couple.partners[0].name} and ${couple.partners[1].name}`}
        >
          {couple.partners.map((partner, index) => (
            <div
              key={partner.name}
              aria-hidden="true"
              className={[
                'flex size-16 items-center justify-center rounded-full border-[3px] border-border text-lg font-semibold shadow-soft',
                index === 0
                  ? 'bg-primary-soft text-primary-strong'
                  : 'bg-surface text-text-secondary',
              ].join(' ')}
            >
              {partner.photo ? (
                <img
                  src={partner.photo}
                  alt=""
                  className="size-full rounded-full object-cover"
                />
              ) : (
                partner.initial
              )}
            </div>
          ))}
        </div>

        <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-text-primary">
          {couple.partners[0].name} &amp; {couple.partners[1].name}
        </h2>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <CalendarDays aria-hidden="true" className="size-3.5 text-primary" />
          <span>
            {formattedStartDate
              ? `Together since ${formattedStartDate}`
              : 'Add your relationship start date'}
          </span>
        </div>
        {couple.description ? (
          <p className="mt-4 max-w-[19rem] text-sm leading-6 text-text-secondary">
            {couple.description}
          </p>
        ) : null}
      </div>
    </Card>
  )
}
