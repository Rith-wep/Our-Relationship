import { Check, Copy, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { AuthField } from '@/features/auth/components/AuthField'
import { AuthMessage } from '@/features/auth/components/AuthMessage'
import type { InvitationResult } from '@/features/onboarding/types'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'

export function InvitePartnerCard() {
  const session = useCoupleSession()
  const [email, setEmail] = useState('')
  const [invitation, setInvitation] = useState<InvitationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!session.couple || session.couple.members.length >= 2) return null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const result = await session.createInvitation(email)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else if (result.data) setInvitation(result.data)
  }

  return (
    <section aria-labelledby="invite-partner-title">
      <h2 id="invite-partner-title" className="text-lg font-semibold">
        Invite your partner
      </h2>
      <div className="mt-3 rounded-card border border-border-strong bg-card p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-button">
            <Send className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">One place, two accounts</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              The link expires after seven days and only works for the email you
              specify.
            </p>
          </div>
        </div>
        {invitation ? (
          <div className="mt-4">
            <p className="break-all rounded-control bg-primary-soft p-3 text-xs leading-5 text-text-secondary">
              {invitation.url}
            </p>
            <Button
              fullWidth
              className="mt-3"
              onClick={() => {
                void navigator.clipboard.writeText(invitation.url).then(() => {
                  setCopied(true)
                })
              }}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? 'Copied' : 'Copy private invitation'}
            </Button>
          </div>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => void submit(event)}
          >
            {error ? <AuthMessage>{error}</AuthMessage> : null}
            <AuthField
              label="Partner’s email"
              name="invitation-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Creating…' : 'Create invitation'}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
