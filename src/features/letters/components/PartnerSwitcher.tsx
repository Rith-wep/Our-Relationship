import type { PartnerIdentity, PartnerId } from '@/features/letters/types'

interface PartnerSwitcherProps {
  partners: readonly PartnerIdentity[]
  currentPartnerId: PartnerId
  onChange: (partnerId: PartnerId) => void
}

export function PartnerSwitcher({
  partners,
  currentPartnerId,
  onChange,
}: PartnerSwitcherProps) {
  return (
    <section
      className="rounded-card border border-dashed border-border-strong bg-surface p-3"
      aria-labelledby="demo-identity-label"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            id="demo-identity-label"
            className="text-xs font-semibold text-text-primary"
          >
            Demo identity
          </p>
          <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
            Simulation only — not authentication
          </p>
        </div>
        <div
          className="flex rounded-full border border-border-strong bg-background p-1"
          role="group"
          aria-label="Choose demo partner"
        >
          {partners.map((partner) => {
            const selected = partner.id === currentPartnerId
            return (
              <button
                key={partner.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(partner.id)}
                className={[
                  'min-h-9 rounded-full px-3 text-xs font-semibold transition-colors motion-reduce:transition-none',
                  selected
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {partner.name}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
