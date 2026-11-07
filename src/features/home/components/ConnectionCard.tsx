import { ArrowRight, Clock3, Heart, MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { CoupleProfile, ThinkingOfYou } from '@/features/couple/types'

function localTime(timezone: string | undefined, now: Date) {
  if (!timezone) return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }).format(now)
  } catch {
    return null
  }
}

function timezoneOffset(timezone: string | undefined, now: Date) {
  if (!timezone) return null
  try {
    const value = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset',
    })
      .formatToParts(now)
      .find((part) => part.type === 'timeZoneName')?.value
    if (!value || value === 'GMT') return 0
    const match = value.match(/GMT([+-])(\d{2}):(\d{2})/)
    if (!match) return null
    const minutes = Number(match[2]) * 60 + Number(match[3])
    return match[1] === '-' ? -minutes : minutes
  } catch {
    return null
  }
}

function meetingLabel(value: string) {
  if (!value) return null
  const meeting = new Date(`${value}T00:00:00.000Z`)
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.ceil((meeting.getTime() - today) / 86_400_000)
  if (days < 0) return null
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

function relativeTime(value: string, now: Date) {
  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - new Date(value).getTime()) / 60_000),
  )
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function ConnectionCard({
  profile,
  userId,
  latest,
  onSend,
}: {
  profile: CoupleProfile
  userId: string
  latest: ThinkingOfYou | null
  onSend: () => Promise<void>
}) {
  const [now, setNow] = useState(() => new Date())
  const [sending, setSending] = useState(false)
  const configuredPartners = profile.partners.filter(
    (partner) => partner.city || partner.country || partner.timezone,
  )
  const meeting = meetingLabel(profile.nextTimeTogether)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const difference = useMemo(() => {
    const first = timezoneOffset(profile.partners[0].timezone, now)
    const second = timezoneOffset(profile.partners[1].timezone, now)
    if (first === null || second === null) return null
    const minutes = Math.abs(first - second)
    if (minutes === 0) return 'Same local time'
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    return `${hours ? `${hours}h` : ''}${remainder ? ` ${remainder}m` : ''} apart`.trim()
  }, [now, profile.partners])

  return (
    <section aria-labelledby="connection-title">
      <h2 id="connection-title" className="text-lg font-semibold">
        Our connection
      </h2>
      <div className="mt-3 overflow-hidden rounded-card border border-border bg-card shadow-soft">
        {configuredPartners.length > 0 ? (
          <div className="grid grid-cols-2 gap-px bg-border">
            {configuredPartners.map((partner) => (
              <div key={partner.id} className="bg-card p-4">
                <p className="truncate text-sm font-semibold">{partner.name}</p>
                {(partner.city || partner.country) && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
                    <MapPin
                      aria-hidden="true"
                      className="size-3 text-primary"
                    />
                    <span className="truncate">
                      {[partner.city, partner.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </p>
                )}
                {localTime(partner.timezone, now) ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
                    <Clock3
                      aria-hidden="true"
                      className="size-3 text-primary"
                    />
                    {localTime(partner.timezone, now)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {difference || meeting ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 text-xs font-medium text-text-secondary">
            {difference ? <span>{difference}</span> : null}
            {difference && meeting ? <span aria-hidden="true">•</span> : null}
            {meeting ? <span>Next time together: {meeting}</span> : null}
          </div>
        ) : null}
        <div className="flex items-center gap-3 border-t border-border p-4">
          <span className="flex size-8 shrink-0 items-center justify-center">
            <Heart
              aria-hidden="true"
              className="size-6 fill-[#ff69b4] text-gray-300"
              strokeWidth={1}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {latest && latest.senderId !== userId
                ? `${latest.senderName} is thinking of you`
                : 'Thinking of you'}
            </p>
            {latest ? (
              <p className="mt-0.5 text-xs text-text-muted">
                {relativeTime(latest.createdAt, now)}
              </p>
            ) : null}
          </div>
          <Button
            size="sm"
            disabled={
              sending ||
              !profile.partners.some((item) => item.id && item.id !== userId)
            }
            onClick={() => {
              setSending(true)
              void onSend().finally(() => setSending(false))
            }}
          >
            Send
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
