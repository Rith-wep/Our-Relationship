import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/Button'
import { AuthField } from '@/features/auth/components/AuthField'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthMessage } from '@/features/auth/components/AuthMessage'
import { useAuth } from '@/features/auth/useAuth'

export function ForgotPasswordPage() {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const result = await auth.requestPasswordReset(email.trim())
    setSubmitting(false)
    if (result.error) setError(result.error)
    else setSent(true)
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      description="Get a secure recovery link."
    >
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        {sent ? (
          <AuthMessage tone="success">
            If an account exists, a recovery email is on its way.
          </AuthMessage>
        ) : null}
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Sending…' : 'Send recovery link'}
        </Button>
      </form>
      <Link
        className="mt-5 block text-center text-sm font-semibold text-primary"
        to="/login"
      >
        Back to sign in
      </Link>
    </AuthLayout>
  )
}
