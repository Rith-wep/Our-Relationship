import { useMemo } from 'react'

import { useMemories } from '@/app/providers/useMemories'
import { AnniversaryCard } from '@/features/home/components/AnniversaryCard'
import { CoupleHero } from '@/features/home/components/CoupleHero'
import { DailyLoveNote } from '@/features/home/components/DailyLoveNote'
import { QuickActions } from '@/features/home/components/QuickActions'
import { RecentMemories } from '@/features/home/components/RecentMemories'
import { RelationshipCounter } from '@/features/home/components/RelationshipCounter'
import { demoCouple } from '@/features/home/data/demoCouple'

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const greeting = useMemo(() => getGreeting(new Date().getHours()), [])
  const { activeMemories } = useMemories()

  return (
    <div className="space-y-8 py-2 pb-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {greeting}
          </p>
          <h1 className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.025em] text-text-primary">
            Our Little Universe
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            A little space, just for us.
          </p>
        </div>
        <div
          className="flex shrink-0 -space-x-2 pt-1"
          aria-label={`${demoCouple.partners[0].name} and ${demoCouple.partners[1].name}`}
        >
          {demoCouple.partners.map((partner, index) => (
            <span
              key={partner.name}
              aria-hidden="true"
              className={[
                'flex size-9 items-center justify-center rounded-full border-2 border-white text-xs font-semibold',
                index === 0
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-orange-100 text-orange-800',
              ].join(' ')}
            >
              {partner.initial}
            </span>
          ))}
        </div>
      </header>

      <CoupleHero couple={demoCouple} />
      <RelationshipCounter
        relationshipStartDate={demoCouple.relationshipStartDate}
      />
      <AnniversaryCard
        relationshipStartDate={demoCouple.relationshipStartDate}
      />
      <DailyLoveNote />
      <RecentMemories memories={activeMemories} />
      <QuickActions />

      <p className="text-center text-[11px] leading-4 text-text-muted">
        Memories are shared across this session and reset when the page
        refreshes.
      </p>
    </div>
  )
}
