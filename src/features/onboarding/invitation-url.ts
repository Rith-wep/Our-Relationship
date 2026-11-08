function invitationOrigin() {
  const configuredOrigin = import.meta.env.VITE_APP_URL?.trim()

  if (!configuredOrigin) return window.location.origin

  try {
    return new URL(configuredOrigin).origin
  } catch {
    console.warn('VITE_APP_URL is invalid; using the current browser origin.')
    return window.location.origin
  }
}

export function createInvitationUrl(token: string) {
  return new URL(
    `/join/${encodeURIComponent(token)}`,
    invitationOrigin(),
  ).toString()
}

export function invitationUrlLabel(url: string) {
  try {
    const parsed = new URL(url)
    const token = parsed.pathname.split('/').filter(Boolean).at(-1) ?? ''
    return `${parsed.origin}/join/••••${token.slice(-6)}`
  } catch {
    return 'Private invitation link ready'
  }
}

export function isLocalInvitationUrl(url: string) {
  try {
    const hostname = new URL(url).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export async function copyInvitationUrl(url: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Copy is unavailable in this browser.')
  }
  await navigator.clipboard.writeText(url)
}

export async function shareInvitationUrl(url: string) {
  if (!navigator.share) return false

  try {
    await navigator.share({
      title: 'Join Our Little Universe',
      text: 'Join our private shared space.',
      url,
    })
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true
    }
    throw error
  }
}
