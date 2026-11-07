export interface SupabasePublicConfig {
  url: string
  publishableKey: string
}

function readRequiredValue(name: string, value: string | undefined) {
  const normalized = value?.trim()
  if (!normalized) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and add the browser-safe value from Supabase project settings.`,
    )
  }
  return normalized
}

function validateUrl(value: string) {
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:' &&
      url.hostname !== '127.0.0.1' &&
      url.hostname !== 'localhost'
    ) {
      throw new Error('Hosted Supabase URLs must use HTTPS.')
    }
    return url.toString().replace(/\/$/, '')
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : ''
    throw new Error(`VITE_SUPABASE_URL is not a valid Supabase URL.${detail}`, {
      cause: error,
    })
  }
}

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = validateUrl(
    readRequiredValue('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  )
  const publishableKey = readRequiredValue(
    'VITE_SUPABASE_PUBLISHABLE_KEY (or legacy VITE_SUPABASE_ANON_KEY)',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      import.meta.env.VITE_SUPABASE_ANON_KEY,
  )

  return { url, publishableKey }
}
