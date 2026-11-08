import {
  Check,
  Copy,
  Link2Off,
  RefreshCw,
  Send,
  Share2,
  TriangleAlert,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import { Button } from '@/components/ui/Button'
import { AuthField } from '@/features/auth/components/AuthField'
import { AuthMessage } from '@/features/auth/components/AuthMessage'
import type {
  InvitationResult,
  InvitationSummary,
} from '@/features/onboarding/types'
import {
  copyInvitationUrl,
  invitationUrlLabel,
  isLocalInvitationUrl,
  shareInvitationUrl,
} from '@/features/onboarding/invitation-url'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function InvitePartnerCard() {
  const session = useCoupleSession()
  const [email, setEmail] = useState('')
  const [invitation, setInvitation] = useState<InvitationResult | null>(null)
  const [summaries, setSummaries] = useState<InvitationSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmingRevoke, setConfirmingRevoke] = useState(false)

  const activeInvitation = useMemo(
    () => summaries.find((item) => item.status === 'active') ?? null,
    [summaries],
  )

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true)
    const result = await session.listInvitations()
    setLoadingStatus(false)
    if (result.error) setError(result.error)
    else setSummaries(result.data ?? [])
  }, [session])

  useEffect(() => {
    if (!session.couple || session.couple.members.length >= 2) return
    const timeout = window.setTimeout(() => void loadStatus(), 0)
    return () => window.clearTimeout(timeout)
  }, [loadStatus, session.couple])

  if (!session.couple || session.couple.members.length >= 2) return null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const result = await session.createInvitation(email)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else if (result.data) {
      setInvitation(result.data)
      setEditing(false)
      setCopied(false)
      await loadStatus()
    }
  }

  const revoke = async (invitationId: string) => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const result = await session.revokeInvitation(invitationId)
    setSubmitting(false)
    setConfirmingRevoke(false)
    if (result.error) setError(result.error)
    else {
      setInvitation(null)
      await loadStatus()
    }
  }

  const currentId = invitation?.invitationId ?? activeInvitation?.invitationId
  const currentExpiry = invitation?.expiresAt ?? activeInvitation?.expiresAt
  const showInvitation = !editing && Boolean(currentId && currentExpiry)

  return (
    <section aria-labelledby="invite-partner-title">
      <h2 id="invite-partner-title" className="text-lg font-semibold">
        Invite your partner
      </h2>
      <div className="mt-3 rounded-card border border-border-strong bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-button">
            <Send className="size-4" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold">One place, two accounts</p>
        </div>

        {error ? <AuthMessage>{error}</AuthMessage> : null}

        {loadingStatus ? (
          <div
            className="mt-4 space-y-3"
            aria-label="Loading invitation status"
          >
            <div className="h-12 animate-pulse rounded-control bg-surface" />
            <div className="h-11 animate-pulse rounded-control bg-surface" />
          </div>
        ) : showInvitation && currentId && currentExpiry ? (
          <div className="mt-4">
            {invitation && isLocalInvitationUrl(invitation.url) ? (
              <div className="mb-3 flex gap-2 rounded-control bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                This local link only works on this device. Set VITE_APP_URL to
                your deployed HTTPS address before sharing it.
              </div>
            ) : null}

            <div className="rounded-control border border-border bg-surface p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-primary">
                  Invitation active
                </p>
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                  Active
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-text-secondary">
                {activeInvitation?.recipientEmail ?? email}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Expires {formatExpiry(currentExpiry)}
              </p>
              {invitation ? (
                <p className="mt-2 truncate text-xs text-text-secondary">
                  {invitationUrlLabel(invitation.url)}
                </p>
              ) : null}
            </div>

            {invitation ? (
              <>
                <Button
                  fullWidth
                  className="mt-3"
                  onClick={() => {
                    setError(null)
                    void copyInvitationUrl(invitation.url)
                      .then(() => setCopied(true))
                      .catch(() =>
                        setError('Could not copy the invitation link.'),
                      )
                  }}
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? 'Copied' : 'Copy private invitation'}
                </Button>
                {'share' in navigator ? (
                  <Button
                    variant="secondary"
                    fullWidth
                    className="mt-3"
                    onClick={() => {
                      setError(null)
                      void shareInvitationUrl(invitation.url).catch(() =>
                        setError(
                          'Could not open sharing. Copy the link instead.',
                        ),
                      )
                    }}
                  >
                    <Share2 className="size-4" />
                    Share invitation
                  </Button>
                ) : null}
              </>
            ) : null}

            {confirmingRevoke ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmingRevoke(false)}
                >
                  Keep link
                </Button>
                <Button
                  disabled={submitting}
                  onClick={() => void revoke(currentId)}
                >
                  Revoke
                </Button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEmail(activeInvitation?.recipientEmail ?? email)
                    setEditing(true)
                  }}
                >
                  <RefreshCw className="size-4" />
                  Replace
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmingRevoke(true)}
                >
                  <Link2Off className="size-4" />
                  Revoke
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => void submit(event)}
          >
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
              {submitting
                ? 'Creating…'
                : editing
                  ? 'Create replacement'
                  : 'Create invitation'}
            </Button>
            {editing ? (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            ) : null}
          </form>
        )}
      </div>
    </section>
  )
}
