import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session } from '@supabase/supabase-js'

import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/auth-context'
import { getFriendlyAuthError } from '@/features/auth/auth-errors'
import { supabase } from '@/lib/supabase/client'
import { clearSignedMediaUrlCache } from '@/lib/supabase/services/storage-service'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) console.error('Unable to restore the Supabase session.')
      setSession(data.session)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      if (!nextSession) clearSignedMediaUrlCache()
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: getFriendlyAuthError(error) }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, emailRedirectTo?: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: emailRedirectTo ? { emailRedirectTo } : undefined,
      })
      return { error: getFriendlyAuthError(error) }
    },
    [],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error: getFriendlyAuthError(error) }
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const redirectTo = new URL(
      '/reset-password',
      window.location.origin,
    ).toString()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    return { error: getFriendlyAuthError(error) }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: getFriendlyAuthError(error) }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
    }),
    [
      loading,
      requestPasswordReset,
      session,
      signIn,
      signOut,
      signUp,
      updatePassword,
    ],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
