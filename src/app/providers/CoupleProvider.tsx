import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  CoupleContext,
  type CoupleContextValue,
} from '@/app/providers/couple-context'
import { useAuth } from '@/features/auth/useAuth'
import type {
  BackgroundPreference,
  ConnectionSettingsDraft,
  CoupleProfile,
  Dream,
  DreamDraft,
  ImportantDate,
  SpecialDateDraft,
  ThinkingOfYou,
} from '@/features/couple/types'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'
import {
  createDateRecord,
  createDreamRecord,
  createThinkingOfYou,
  deleteDateRecord,
  deleteDreamRecord,
  loadCoupleData,
  removeProfilePhotoRecord,
  replaceProfilePhoto,
  updateConnectionSettings,
  updateCoupleBackground,
  updateCoupleProfile,
  updateDateRecord,
  updateDreamRecord,
} from '@/lib/supabase/services/couple-service'
import { useRealtimeSubscription } from '@/lib/supabase/useRealtimeSubscription'

const emptyProfile: CoupleProfile = {
  partners: [
    { id: '', name: '', initial: '?' },
    { id: '', name: '', initial: '?' },
  ],
  relationshipStartDate: '',
  description: '',
  nextTimeTogether: '',
  background: { preset: 'default' },
}

function profileFromSession(
  couple: NonNullable<ReturnType<typeof useCoupleSession>['couple']>,
): CoupleProfile {
  const partners = couple.members.slice(0, 2).map((member) => ({
    id: member.userId,
    name: member.displayName,
    initial: member.displayName.charAt(0).toUpperCase() || '?',
  }))
  while (partners.length < 2) {
    partners.push({
      id: '',
      name: 'Waiting for partner',
      initial: '?',
    })
  }
  return {
    partners: [partners[0], partners[1]],
    relationshipStartDate: couple.relationshipStartDate ?? '',
    description: couple.description,
    nextTimeTogether: '',
    background: { preset: 'default' },
  }
}

export function CoupleProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const session = useCoupleSession()
  const [profile, setProfile] = useState<CoupleProfile>(emptyProfile)
  const [dreams, setDreams] = useState<Dream[]>([])
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([])
  const [latestThinkingOfYou, setLatestThinkingOfYou] =
    useState<ThinkingOfYou | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0)
  const pendingRefreshRef = useRef<Promise<void> | null>(null)
  const bootstrapKeyRef = useRef<string | null>(null)

  const retry = useCallback(
    (showLoading = true) => {
      if (pendingRefreshRef.current) return pendingRefreshRef.current
      const request = (async () => {
        if (!session.couple) {
          setProfile(emptyProfile)
          setDreams([])
          setImportantDates([])
          setLatestThinkingOfYou(null)
          setLoading(false)
          return
        }
        if (showLoading) setLoading(true)
        setError(null)
        try {
          const data = await loadCoupleData(
            session.couple.coupleId,
            session.couple.members.map((member) => member.userId),
          )
          setProfile(data.profile)
          setDreams(data.dreams)
          setImportantDates(data.importantDates)
          setLatestThinkingOfYou(data.latestThinkingOfYou)
        } catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Unable to load relationship data.',
          )
        } finally {
          if (showLoading) setLoading(false)
        }
      })()
      pendingRefreshRef.current = request
      void request.finally(() => {
        if (pendingRefreshRef.current === request) {
          pendingRefreshRef.current = null
        }
      })
      return request
    },
    [session.couple],
  )

  useEffect(() => {
    const couple = session.couple
    if (!couple) {
      bootstrapKeyRef.current = null
      const timeout = window.setTimeout(() => void retry(false), 0)
      return () => window.clearTimeout(timeout)
    }

    const bootstrapKey = `${couple.coupleId}:${auth.user?.id ?? ''}`
    if (bootstrapKeyRef.current !== bootstrapKey) {
      bootstrapKeyRef.current = bootstrapKey
      setProfile(profileFromSession(couple))
      setDreams([])
      setImportantDates([])
      setLatestThinkingOfYou(null)
      setError(null)
      setLoading(false)
    }

    const timeout = window.setTimeout(() => void retry(false), 0)
    return () => window.clearTimeout(timeout)
  }, [auth.user?.id, retry, session.couple])

  const realtimeTargets = useMemo(() => {
    if (!session.couple) return []
    return [
      { table: 'couples', filter: `id=eq.${session.couple.coupleId}` },
      ...session.couple.members.map((member) => ({
        table: 'profiles',
        filter: `id=eq.${member.userId}`,
      })),
      {
        table: 'dreams',
        filter: `couple_id=eq.${session.couple.coupleId}`,
      },
      {
        table: 'important_dates',
        filter: `couple_id=eq.${session.couple.coupleId}`,
      },
      {
        table: 'thinking_of_you',
        filter: `couple_id=eq.${session.couple.coupleId}`,
      },
    ]
  }, [session.couple])
  const realtimeState = useRealtimeSubscription({
    enabled: Boolean(session.couple && auth.user),
    name: `couple:${session.couple?.coupleId ?? 'signed-out'}`,
    targets: realtimeTargets,
    onChange: () => retry(false),
  })

  const runMutation = useCallback(
    async (operation: () => Promise<void>) => {
      setError(null)
      try {
        await operation()
        await retry(false)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Update failed.')
      }
    },
    [retry],
  )

  const updateProfile = useCallback(
    (nextProfile: CoupleProfile) =>
      runMutation(async () => {
        if (!session.couple || !auth.user) throw new Error('Not signed in.')
        await updateCoupleProfile({
          coupleId: session.couple.coupleId,
          userId: auth.user.id,
          profile: nextProfile,
        })
        await session.refresh()
      }),
    [auth.user, runMutation, session],
  )

  const updateConnection = useCallback(
    async (settings: ConnectionSettingsDraft) => {
      setError(null)
      try {
        if (!session.couple || !auth.user) throw new Error('Not signed in.')
        await updateConnectionSettings({
          coupleId: session.couple.coupleId,
          userId: auth.user.id,
          settings,
        })
        await retry(false)
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : 'Connection settings update failed.'
        setError(message)
        throw new Error(message, { cause: caught })
      }
    },
    [auth.user, retry, session.couple],
  )

  const updateBackground = useCallback(
    async (background: BackgroundPreference) => {
      if (!session.couple) return
      const previous = profile.background
      setProfile((current) => ({ ...current, background }))
      setError(null)
      try {
        await updateCoupleBackground(session.couple.coupleId, background)
        await retry(false)
      } catch (caught) {
        setProfile((current) => ({ ...current, background: previous }))
        setError(
          caught instanceof Error
            ? caught.message
            : 'Background update failed.',
        )
      }
    },
    [profile.background, retry, session.couple],
  )

  const uploadProfilePhoto = useCallback(
    (file: File) =>
      runMutation(async () => {
        if (!session.couple || !auth.user) throw new Error('Not signed in.')
        const current = profile.partners.find(
          (item) => item.id === auth.user?.id,
        )
        setUploadingPhoto(true)
        setPhotoUploadProgress(0)
        try {
          await replaceProfilePhoto({
            coupleId: session.couple.coupleId,
            userId: auth.user.id,
            oldPath: current?.photoPath,
            file,
            progress: setPhotoUploadProgress,
          })
        } finally {
          setUploadingPhoto(false)
        }
      }),
    [auth.user, profile.partners, runMutation, session.couple],
  )

  const removeProfilePhoto = useCallback(
    () =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        const current = profile.partners.find(
          (item) => item.id === auth.user?.id,
        )
        await removeProfilePhotoRecord({
          userId: auth.user.id,
          oldPath: current?.photoPath,
        })
      }),
    [auth.user, profile.partners, runMutation],
  )

  const createDream = useCallback(
    (draft: DreamDraft) =>
      runMutation(async () => {
        if (!session.couple || !auth.user) throw new Error('Not signed in.')
        await createDreamRecord(session.couple.coupleId, auth.user.id, draft)
      }),
    [auth.user, runMutation, session.couple],
  )

  const updateDream = useCallback(
    (id: string, draft: DreamDraft) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        await updateDreamRecord(id, auth.user.id, draft)
      }),
    [auth.user, runMutation],
  )

  const toggleDream = useCallback(
    (id: string) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        const dream = dreams.find((item) => item.id === id)
        if (!dream) throw new Error('Dream was not found.')
        await updateDreamRecord(id, auth.user.id, {
          completed: !dream.completed,
        })
      }),
    [auth.user, dreams, runMutation],
  )

  const deleteDream = useCallback(
    (id: string) => runMutation(() => deleteDreamRecord(id)),
    [runMutation],
  )

  const createSpecialDate = useCallback(
    (draft: SpecialDateDraft) =>
      runMutation(async () => {
        if (!session.couple || !auth.user) throw new Error('Not signed in.')
        await createDateRecord(session.couple.coupleId, auth.user.id, draft)
      }),
    [auth.user, runMutation, session.couple],
  )

  const updateSpecialDate = useCallback(
    (id: string, draft: SpecialDateDraft) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        await updateDateRecord(id, auth.user.id, draft)
      }),
    [auth.user, runMutation],
  )

  const deleteSpecialDate = useCallback(
    (id: string) => runMutation(() => deleteDateRecord(id)),
    [runMutation],
  )

  const sendThinkingOfYou = useCallback(
    () =>
      runMutation(async () => {
        if (!session.couple || !auth.user) throw new Error('Not signed in.')
        await createThinkingOfYou(session.couple.coupleId, auth.user.id)
      }),
    [auth.user, runMutation, session.couple],
  )

  const value = useMemo<CoupleContextValue>(
    () => ({
      profile,
      dreams,
      importantDates,
      latestThinkingOfYou,
      loading,
      error,
      uploadingPhoto,
      photoUploadProgress,
      realtimeState,
      retry,
      updateProfile,
      updateConnection,
      updateBackground,
      uploadProfilePhoto,
      removeProfilePhoto,
      sendThinkingOfYou,
      createDream,
      updateDream,
      toggleDream,
      deleteDream,
      createSpecialDate,
      updateSpecialDate,
      deleteSpecialDate,
    }),
    [
      createDream,
      createSpecialDate,
      deleteDream,
      deleteSpecialDate,
      dreams,
      error,
      importantDates,
      latestThinkingOfYou,
      loading,
      profile,
      photoUploadProgress,
      realtimeState,
      removeProfilePhoto,
      sendThinkingOfYou,
      retry,
      toggleDream,
      updateDream,
      updateConnection,
      updateProfile,
      updateBackground,
      uploadProfilePhoto,
      uploadingPhoto,
      updateSpecialDate,
    ],
  )

  return <CoupleContext value={value}>{children}</CoupleContext>
}
