import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useAuth } from '@/features/auth/useAuth'
import {
  CoupleSessionContext,
  type CoupleSessionContextValue,
} from '@/features/onboarding/couple-session-context'
import { getFriendlyOnboardingError } from '@/features/onboarding/onboarding-errors'
import type {
  CoupleActionResult,
  CoupleMemberIdentity,
  CoupleSession,
  InvitationResult,
} from '@/features/onboarding/types'
import { supabase } from '@/lib/supabase/client'

interface MembershipRow {
  couple_id: string
  joined_at: string
  couples: {
    relationship_start_date: string | null
    description: string
  } | null
}

interface MemberRow {
  user_id: string
  joined_at: string
}

interface InvitationRow {
  invitation_id: string
  raw_token: string
  expires_at: string
}

interface RpcResult<T> {
  data: T
  error: { message: string } | null
}

function readDisplayName(value: unknown) {
  if (
    typeof value === 'object' &&
    value !== null &&
    'display_name' in value &&
    typeof value.display_name === 'string'
  ) {
    return value.display_name
  }
  return null
}

export function CoupleSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [couple, setCouple] = useState<CoupleSession | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setCouple(null)
      setDisplayName(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const [profileResult, membershipResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('couple_members')
        .select(
          'couple_id, joined_at, couples(relationship_start_date, description)',
        )
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    if (profileResult.error || membershipResult.error) {
      setError(
        profileResult.error?.message ??
          membershipResult.error?.message ??
          'Unable to load your shared space.',
      )
      setLoading(false)
      return
    }

    const profileData: unknown = profileResult.data
    setDisplayName(readDisplayName(profileData))
    const membership = membershipResult.data as MembershipRow | null
    if (!membership?.couples) {
      setCouple(null)
      setLoading(false)
      return
    }

    const membersResult = await supabase
      .from('couple_members')
      .select('user_id, joined_at')
      .eq('couple_id', membership.couple_id)
      .order('joined_at')

    if (membersResult.error) {
      setError(membersResult.error.message)
      setLoading(false)
      return
    }

    const memberRows = membersResult.data as MemberRow[]
    const profilesResult = await supabase
      .from('profiles')
      .select('id, display_name')
      .in(
        'id',
        memberRows.map((member) => member.user_id),
      )
    if (profilesResult.error) {
      setError(profilesResult.error.message)
      setLoading(false)
      return
    }
    const names = new Map(
      (profilesResult.data as { id: string; display_name: string }[]).map(
        (profile) => [profile.id, profile.display_name],
      ),
    )
    const members = memberRows.map<CoupleMemberIdentity>((member) => ({
      userId: member.user_id,
      joinedAt: member.joined_at,
      displayName: names.get(member.user_id) ?? 'Partner',
    }))
    setCouple({
      coupleId: membership.couple_id,
      relationshipStartDate: membership.couples.relationship_start_date,
      description: membership.couples.description,
      members,
    })
    setLoading(false)
  }, [user])

  useEffect(() => {
    const timeout = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(timeout)
  }, [refresh])

  const upsertProfile = useCallback(
    async (name: string): Promise<CoupleActionResult> => {
      if (!user) return { error: 'You must be signed in.' }
      const normalizedName = name.trim()
      if (!normalizedName) return { error: 'Enter your display name.' }
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, display_name: normalizedName },
          { onConflict: 'id' },
        )
      if (profileError) {
        return { error: getFriendlyOnboardingError(profileError.message) }
      }
      setDisplayName(normalizedName)
      return { error: null }
    },
    [user],
  )

  const createSpace = useCallback(
    async (input: {
      displayName: string
      relationshipDate: string | null
      description: string
      recipientEmail: string
    }): Promise<CoupleActionResult<InvitationResult>> => {
      const profileResult = await upsertProfile(input.displayName)
      if (profileResult.error) return { error: profileResult.error }

      const { data: coupleId, error: coupleError } = (await supabase.rpc(
        'create_couple',
        {
          relationship_date: input.relationshipDate || null,
          couple_description: input.description.trim(),
        },
      )) as RpcResult<string | null>
      if (coupleError || !coupleId) {
        return {
          error: getFriendlyOnboardingError(coupleError?.message),
        }
      }

      const { data, error: invitationError } = (await supabase.rpc(
        'create_couple_invitation',
        {
          target_couple: coupleId,
          recipient_user: null,
          recipient_email_address: input.recipientEmail.trim().toLowerCase(),
          valid_for: '7 days',
        },
      )) as RpcResult<InvitationRow[] | null>
      if (invitationError || !data?.[0]) {
        await refresh()
        return {
          error: getFriendlyOnboardingError(invitationError?.message),
        }
      }

      const invitation = data[0]
      const url = new URL('/onboarding', window.location.origin)
      url.searchParams.set('invite', invitation.raw_token)
      return {
        data: {
          invitationId: invitation.invitation_id,
          token: invitation.raw_token,
          expiresAt: invitation.expires_at,
          url: url.toString(),
        },
        error: null,
      }
    },
    [refresh, upsertProfile],
  )

  const createInvitation = useCallback(
    async (
      recipientEmail: string,
    ): Promise<CoupleActionResult<InvitationResult>> => {
      if (!couple) return { error: 'Your shared space is not available.' }
      const { data, error: invitationError } = (await supabase.rpc(
        'create_couple_invitation',
        {
          target_couple: couple.coupleId,
          recipient_user: null,
          recipient_email_address: recipientEmail.trim().toLowerCase(),
          valid_for: '7 days',
        },
      )) as RpcResult<InvitationRow[] | null>
      if (invitationError || !data?.[0]) {
        return {
          error: getFriendlyOnboardingError(invitationError?.message),
        }
      }
      const invitation = data[0]
      const url = new URL('/onboarding', window.location.origin)
      url.searchParams.set('invite', invitation.raw_token)
      return {
        data: {
          invitationId: invitation.invitation_id,
          token: invitation.raw_token,
          expiresAt: invitation.expires_at,
          url: url.toString(),
        },
        error: null,
      }
    },
    [couple],
  )

  const acceptInvitation = useCallback(
    async (token: string, name: string): Promise<CoupleActionResult> => {
      const profileResult = await upsertProfile(name)
      if (profileResult.error) return profileResult
      const { error: invitationError } = (await supabase.rpc(
        'accept_couple_invitation',
        { raw_token: token },
      )) as RpcResult<string | null>
      if (invitationError) {
        return {
          error: getFriendlyOnboardingError(invitationError.message),
        }
      }
      await refresh()
      return { error: null }
    },
    [refresh, upsertProfile],
  )

  const value = useMemo<CoupleSessionContextValue>(
    () => ({
      couple,
      displayName,
      loading,
      error,
      refresh,
      createSpace,
      acceptInvitation,
      createInvitation,
    }),
    [
      acceptInvitation,
      couple,
      createInvitation,
      createSpace,
      displayName,
      error,
      loading,
      refresh,
    ],
  )

  return <CoupleSessionContext value={value}>{children}</CoupleSessionContext>
}
