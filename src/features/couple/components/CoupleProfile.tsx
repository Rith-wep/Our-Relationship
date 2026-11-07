import { CalendarDays, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { CoupleProfile as CoupleProfileType } from '@/features/couple/types'
import { useRelationshipDuration } from '@/features/home/hooks/useRelationshipDuration'

export function CoupleProfile({
  profile,
  onEdit,
}: {
  profile: CoupleProfileType
  onEdit: () => void
}) {
  const duration = useRelationshipDuration(profile.relationshipStartDate)

  return (
    <Card className="overflow-hidden border-primary/10 bg-primary-soft/45">
      <div className="flex flex-col items-center text-center">
        <div className="flex -space-x-4">
          {profile.partners.map((partner, index) => (
            <div
              key={partner.id}
              className={[
                'flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-white text-xl font-semibold shadow-soft',
                index === 0
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-orange-100 text-orange-800',
              ].join(' ')}
            >
              {partner.photo ? (
                <img
                  src={partner.photo}
                  alt={`${partner.name} profile`}
                  className="size-full object-cover"
                />
              ) : (
                partner.initial
              )}
            </div>
          ))}
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-text-primary">
          {profile.partners[0].name} &amp; {profile.partners[1].name}
        </h2>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
          <CalendarDays aria-hidden="true" className="size-3.5 text-primary" />
          <span>
            {duration.status === 'active'
              ? `${duration.totalDays.toLocaleString()} days together`
              : 'A story waiting to begin'}
          </span>
        </div>
        <p className="mt-4 max-w-xs text-sm leading-6 text-text-secondary">
          {profile.description}
        </p>
        <Button variant="secondary" size="sm" onClick={onEdit} className="mt-5">
          <Pencil aria-hidden="true" className="size-4" /> Edit Profile
        </Button>
      </div>
    </Card>
  )
}
