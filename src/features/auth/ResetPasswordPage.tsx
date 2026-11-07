import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/Button'
import { AuthField } from '@/features/auth/components/AuthField'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthMessage } from '@/features/auth/components/AuthMessage'
import { useAuth } from '@/features/auth/useAuth'

export function ResetPasswordPage() {
  const auth = useAuth()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [updated, setUpdated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setError(null)
    if (!auth.session) {
      setError('Open this page using the recovery link sent to your email.')
      return
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    if (password !== confirmation) {
      setError('The passwords do not match.')
      return
    }
    setSubmitting(true)
    const result = await auth.updatePassword(password)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else setUpdated(true)
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Use a strong password you don’t reuse elsewhere."
    >
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        {updated ? (
          <AuthMessage tone="success">
            Your password has been updated.
          </AuthMessage>
        ) : null}
        <AuthField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <AuthField
          label="Confirm new password"
          name="password-confirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
        <Button type="submit" fullWidth disabled={submitting || updated}>
          {submitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
      <Link
        className="mt-5 block text-center text-sm font-semibold text-primary"
        to={auth.session ? '/' : '/login'}
      >
        {auth.session ? 'Continue to the app' : 'Back to sign in'}
      </Link>
    </AuthLayout>
  )
}
