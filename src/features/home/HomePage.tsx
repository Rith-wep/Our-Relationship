import { MoonStar, Sun, Sunrise, Sunset } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useCouple } from '@/app/providers/useCouple'
import { useMemories } from '@/app/providers/useMemories'
import { useAuth } from '@/features/auth/useAuth'
import { AnniversaryCard } from '@/features/home/components/AnniversaryCard'
import { CoupleHero } from '@/features/home/components/CoupleHero'
import { ConnectionCard } from '@/features/home/components/ConnectionCard'
import { DailyLoveNote } from '@/features/home/components/DailyLoveNote'
import { QuickActions } from '@/features/home/components/QuickActions'
import { RecentMemories } from '@/features/home/components/RecentMemories'
import { RelationshipCounter } from '@/features/home/components/RelationshipCounter'

function getGreeting(hour: number) {
  if (hour < 5) return { label: 'Good night', icon: MoonStar }
  if (hour < 12) return { label: 'Good morning', icon: Sunrise }
  if (hour < 17) return { label: 'Good afternoon', icon: Sun }
  if (hour < 21) return { label: 'Good evening', icon: Sunset }
  return { label: 'Good night', icon: MoonStar }
}

export function HomePage() {
  const [hour, setHour] = useState(() => new Date().getHours())
  const greeting = getGreeting(hour)
  const GreetingIcon = greeting.icon
  const { activeMemories } = useMemories()
  const couple = useCouple()
  const { profile } = couple
  const auth = useAuth()

  useEffect(() => {
    const timer = window.setInterval(
      () => setHour(new Date().getHours()),
      60_000,
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8 py-2 pb-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <GreetingIcon aria-hidden="true" className="size-4" />
            {greeting.label}
          </p>
          <h1 className="page-title-outlined mt-1 text-[1.75rem] leading-9 font-semibold tracking-[-0.025em]">
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
      <ConnectionCard
        profile={profile}
        userId={auth.user?.id ?? ''}
        latest={couple.latestThinkingOfYou}
        onSend={couple.sendThinkingOfYou}
      />
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
