import { useMemo } from 'react'

import { useCouple } from '@/app/providers/useCouple'
import { useMemories } from '@/app/providers/useMemories'
import { AnniversaryCard } from '@/features/home/components/AnniversaryCard'
import { CoupleHero } from '@/features/home/components/CoupleHero'
import { DailyLoveNote } from '@/features/home/components/DailyLoveNote'
import { QuickActions } from '@/features/home/components/QuickActions'
import { RecentMemories } from '@/features/home/components/RecentMemories'
import { RelationshipCounter } from '@/features/home/components/RelationshipCounter'

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const greeting = useMemo(() => getGreeting(new Date().getHours()), [])
  const { activeMemories } = useMemories()
  const { profile } = useCouple()

  return (
    <div className="space-y-8 py-2 pb-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {greeting}
          </p>
          <h1 className="page-title-outlined mt-1 text-2xl leading-8 font-semibold tracking-[-0.025em]">
            Our Little Universe
          </h1>
        </div>
        <div
          className="flex shrink-0 -space-x-2 pt-1"
          aria-label={`${profile.partners[0].name} and ${profile.partners[1].name}`}
        >
          {profile.partners.map((partner, index) => (
            <span
              key={partner.name}
              aria-hidden="true"
              className={[
                'flex size-9 items-center justify-center rounded-full border-2 border-border text-xs font-semibold',
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
            </span>
          ))}
        </div>
      </header>

      <CoupleHero couple={profile} />
      <RelationshipCounter
        relationshipStartDate={profile.relationshipStartDate}
      />
      <AnniversaryCard relationshipStartDate={profile.relationshipStartDate} />
      <DailyLoveNote />
      <RecentMemories memories={activeMemories} />
      <QuickActions />
    </div>
  )
}
