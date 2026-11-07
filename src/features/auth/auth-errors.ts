import type { AuthError } from '@supabase/supabase-js'

export function getFriendlyAuthError(error: AuthError | null) {
  if (!error) return null

  switch (error.code) {
    case 'invalid_credentials':
      return 'The email or password is incorrect.'
    case 'email_not_confirmed':
      return 'Please confirm your email before signing in.'
    case 'user_already_exists':
    case 'email_exists':
      return 'An account already exists for this email.'
    case 'weak_password':
      return 'Choose a stronger password with at least 8 characters.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return error.message || 'Something went wrong. Please try again.'
  }
}
