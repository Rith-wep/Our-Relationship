import { CalendarDays } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import type { DemoCouple } from '@/features/home/data/demoCouple'

interface CoupleHeroProps {
  couple: DemoCouple
}

const startDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function CoupleHero({ couple }: CoupleHeroProps) {
  const formattedStartDate = startDateFormatter.format(
    new Date(`${couple.relationshipStartDate}T00:00:00.000Z`),
  )

  return (
    <Card className="overflow-hidden border-primary/10 bg-primary-soft/55 p-0">
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
                'flex size-16 items-center justify-center rounded-full border-[3px] border-white text-lg font-semibold shadow-soft',
                index === 0
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-orange-100 text-orange-800',
              ].join(' ')}
            >
              {partner.initial}
            </div>
          ))}
        </div>

        <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-text-primary">
          {couple.partners[0].name} &amp; {couple.partners[1].name}
        </h2>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <CalendarDays aria-hidden="true" className="size-3.5 text-primary" />
          <span>Together since {formattedStartDate}</span>
        </div>
        <p className="mt-4 max-w-[19rem] text-sm leading-6 text-text-secondary">
          {couple.caption}
        </p>
      </div>
    </Card>
  )
}
