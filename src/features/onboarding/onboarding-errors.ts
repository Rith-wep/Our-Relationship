export function getFriendlyOnboardingError(message?: string) {
  const normalized = message?.toLowerCase() ?? ''
  if (normalized.includes('expired')) {
    return 'This invitation has expired. Ask your partner for a new link.'
  }
  if (normalized.includes('already used')) {
    return 'This invitation has already been used.'
  }
  if (normalized.includes('revoked')) {
    return 'This invitation is no longer active. Ask your partner for a new link.'
  }
  if (
    normalized.includes('another email') ||
    normalized.includes('another user')
  ) {
    return 'This invitation was created for a different account.'
  }
  if (normalized.includes('already has two members')) {
    return 'This shared space already has two partners.'
  }
  if (normalized.includes('already belongs')) {
    return 'This account already belongs to a shared space.'
  }
  if (normalized.includes('invalid invitation')) {
    return 'This invitation link is invalid.'
  }
  return message || 'Something went wrong. Please try again.'
}
