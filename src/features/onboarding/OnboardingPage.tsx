import {
  Check,
  Copy,
  Heart,
  Link2,
  Share2,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/Button'
import { AuthField } from '@/features/auth/components/AuthField'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthMessage } from '@/features/auth/components/AuthMessage'
import type { InvitationResult } from '@/features/onboarding/types'
import {
  copyInvitationUrl,
  invitationUrlLabel,
  isLocalInvitationUrl,
  shareInvitationUrl,
} from '@/features/onboarding/invitation-url'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'

export function OnboardingPage() {
  const session = useCoupleSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { inviteToken = '' } = useParams<{ inviteToken: string }>()
  const invitationToken =
    inviteToken.trim() || searchParams.get('invite')?.trim() || ''
  const [displayName, setDisplayName] = useState(session.displayName ?? '')
  const [relationshipDate, setRelationshipDate] = useState('')
  const [description, setDescription] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const expiresLabel = useMemo(() => {
    if (!invitation) return ''
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(invitation.expiresAt))
  }, [invitation])

  const accept = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const result = await session.acceptInvitation(invitationToken, displayName)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else void navigate('/', { replace: true })
  }

  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const result = await session.createSpace({
      displayName,
      relationshipDate: relationshipDate || null,
      description,
      recipientEmail,
    })
    setSubmitting(false)
    if (result.error) setError(result.error)
    else if (result.data) setInvitation(result.data)
  }

  if (invitation) {
    return (
      <AuthLayout
        eyebrow="Invitation ready"
        title="Bring your partner in"
        description="A single-use link for their email."
      >
        {isLocalInvitationUrl(invitation.url) ? (
          <div className="mb-4 flex gap-2 rounded-control bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            This local link only works on this device. Set VITE_APP_URL to your
            deployed HTTPS address before sharing it.
          </div>
        ) : null}
        <div className="flex items-start gap-3 rounded-control bg-primary-soft p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Link2 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              Expires {expiresLabel}
            </p>
            <p className="mt-1 truncate text-xs leading-5 text-text-secondary">
              {invitationUrlLabel(invitation.url)}
            </p>
          </div>
        </div>
        {shareError ? <AuthMessage>{shareError}</AuthMessage> : null}
        <Button
          fullWidth
          className="mt-4"
          onClick={() => {
            setShareError(null)
            void copyInvitationUrl(invitation.url)
              .then(() => setCopied(true))
              .catch(() => {
                setShareError('Could not copy the link. Try Share instead.')
              })
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy invitation link'}
        </Button>
        {'share' in navigator ? (
          <Button
            variant="secondary"
            fullWidth
            className="mt-3"
            onClick={() => {
              setShareError(null)
              void shareInvitationUrl(invitation.url).catch(() => {
                setShareError('Could not open sharing. Copy the link instead.')
              })
            }}
          >
            <Share2 className="size-4" />
            Share invitation
          </Button>
        ) : null}
        <Button
          variant="secondary"
          fullWidth
          className="mt-3"
          onClick={() => {
            void session.refresh().then(() => navigate('/', { replace: true }))
          }}
        >
          Continue to our space
        </Button>
        <p className="mt-4 text-xs leading-5 text-text-muted">
          Share this link privately. Anyone with the link still needs the
          invited email account, and the database permits only two partners.
        </p>
      </AuthLayout>
    )
  }

  if (invitationToken) {
    return (
      <AuthLayout
        eyebrow="You’ve been invited"
        title="Join your shared space"
        description="Choose your display name."
      >
        <form className="space-y-4" onSubmit={(event) => void accept(event)}>
          {error ? <AuthMessage>{error}</AuthMessage> : null}
          <div className="flex items-center gap-3 rounded-control bg-primary-soft p-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
              <Heart className="size-4 fill-current" aria-hidden="true" />
            </span>
            <p className="text-sm leading-5 text-text-secondary">
              Your account will become the second and final partner.
            </p>
          </div>
          <AuthField
            label="Your display name"
            name="display-name"
            autoComplete="name"
            maxLength={80}
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Joining…' : 'Accept invitation'}
          </Button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="A private place for two"
      title="Create your shared space"
    >
      <form className="space-y-4" onSubmit={(event) => void create(event)}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        <div className="flex items-center gap-3 rounded-control bg-primary-soft p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
            <Users className="size-4" aria-hidden="true" />
          </span>
          <p className="text-sm leading-5 text-text-secondary">
            Both partners have equal access to this shared space.
          </p>
        </div>
        <AuthField
          label="Your display name"
          name="display-name"
          autoComplete="name"
          maxLength={80}
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <AuthField
          label="Partner’s email"
          name="partner-email"
          type="email"
          autoComplete="email"
          required
          value={recipientEmail}
          onChange={(event) => setRecipientEmail(event.target.value)}
        />
        <AuthField
          label="Relationship start date (optional)"
          name="relationship-date"
          type="date"
          value={relationshipDate}
          onChange={(event) => setRelationshipDate(event.target.value)}
        />
        <label className="block" htmlFor="couple-description">
          <span className="text-sm font-medium text-text-primary">
            A note about you two (optional)
          </span>
          <textarea
            id="couple-description"
            maxLength={1000}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="form-control mt-2 resize-none py-3 leading-6"
          />
        </label>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Creating…' : 'Create space and invitation'}
        </Button>
      </form>
    </AuthLayout>
  )
}
