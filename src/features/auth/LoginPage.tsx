import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { AuthField } from '@/features/auth/components/AuthField'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthMessage } from '@/features/auth/components/AuthMessage'
import { useAuth } from '@/features/auth/useAuth'

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const destination = (location.state as { from?: string } | null)?.from ?? '/'

  if (!auth.loading && auth.session) {
    return <Navigate to={destination} replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const result = await auth.signIn(email.trim(), password)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else {
      void navigate(destination, { replace: true })
    }
  }

  return (
    <AuthLayout eyebrow="Our Little Universe" title="Welcome back">
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="text-right">
          <Link
            className="text-sm font-medium text-primary"
            to="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-text-secondary">
        New here?{' '}
        <Link
          className="font-semibold text-primary"
          to="/register"
          state={{ from: destination }}
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
