import { type FormEvent, useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { CoupleProfile } from '@/features/couple/types'

export function ConnectionSettingsForm({
  profile,
  userId,
  onCancel,
  onSave,
}: {
  profile: CoupleProfile
  userId: string
  onCancel: () => void
  onSave: (profile: CoupleProfile) => void
}) {
  const current = profile.partners.find((partner) => partner.id === userId)
  const [city, setCity] = useState(current?.city ?? '')
  const [country, setCountry] = useState(current?.country ?? '')
  const [timezone, setTimezone] = useState(current?.timezone ?? '')
  const [nextTimeTogether, setNextTimeTogether] = useState(
    profile.nextTimeTogether,
  )
  const timezones = useMemo(() => {
    const supported = Intl.supportedValuesOf('timeZone')
    const device = Intl.DateTimeFormat().resolvedOptions().timeZone
    return [device, ...supported.filter((item) => item !== device)]
  }, [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const partners = profile.partners.map((partner) =>
      partner.id === userId
        ? {
            ...partner,
            city: city.trim() || undefined,
            country: country.trim() || undefined,
            timezone: timezone || undefined,
          }
        : partner,
    ) as CoupleProfile['partners']
    onSave({ ...profile, partners, nextTimeTogether })
  }

  return (
    <form onSubmit={submit} className="flex max-h-[calc(90dvh-5rem)] flex-col">
      <div className="space-y-5 overflow-y-auto p-5">
        <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
          <div>
            <label htmlFor="connection-city" className="form-label">
              Your city
            </label>
            <input
              id="connection-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              maxLength={100}
              autoComplete="address-level2"
              placeholder="City"
              className="form-control"
            />
          </div>
          <div>
            <label htmlFor="connection-country" className="form-label">
              Country
            </label>
            <input
              id="connection-country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              maxLength={100}
              autoComplete="country-name"
              placeholder="Country"
              className="form-control"
            />
          </div>
        </div>
        <div>
          <label htmlFor="connection-timezone" className="form-label">
            Timezone
          </label>
          <select
            id="connection-timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="form-control"
          >
            <option value="">Not set</option>
            {timezones.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="next-time-together" className="form-label">
            Next time together
          </label>
          <input
            id="next-time-together"
            type="date"
            value={nextTimeTogether}
            onChange={(event) => setNextTimeTogether(event.target.value)}
            className="form-control"
          />
        </div>
        <p className="text-xs leading-5 text-text-muted">
          Only city, country, and timezone are shared. Precise location is never
          collected.
        </p>
      </div>
      <div className="flex gap-3 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          Save
        </Button>
      </div>
    </form>
  )
}
