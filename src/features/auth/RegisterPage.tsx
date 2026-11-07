import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { AuthField } from '@/features/auth/components/AuthField'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthMessage } from '@/features/auth/components/AuthMessage'
import { useAuth } from '@/features/auth/useAuth'

export function RegisterPage() {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const destination = (location.state as { from?: string } | null)?.from ?? '/'

  if (!auth.loading && auth.session) {
    return <Navigate to={destination} replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setMessage(null)
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    if (password !== confirmation) {
      setError('The passwords do not match.')
      return
    }
    setSubmitting(true)
    const redirectUrl = new URL(destination, window.location.origin).toString()
    const result = await auth.signUp(email.trim(), password, redirectUrl)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else if (auth.session) void navigate(destination, { replace: true })
    else
      setMessage(
        'Account created. Check your email if confirmation is enabled.',
      )
  }

  return (
    <AuthLayout
      eyebrow="A private place for two"
      title="Create your account"
      description="Create your private account."
    >
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <AuthField
          label="Confirm password"
          name="password-confirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link
          className="font-semibold text-primary"
          to="/login"
          state={{ from: destination }}
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
