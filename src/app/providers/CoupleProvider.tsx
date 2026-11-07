import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CoupleContext,
  type CoupleContextValue,
} from '@/app/providers/couple-context'
import { useAuth } from '@/features/auth/useAuth'
import type {
  CoupleProfile,
  Dream,
  DreamDraft,
  ImportantDate,
  SpecialDateDraft,
} from '@/features/couple/types'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'
import {
  createDateRecord,
  createDreamRecord,
  deleteDateRecord,
  deleteDreamRecord,
  loadCoupleData,
  removeProfilePhotoRecord,
  replaceProfilePhoto,
  updateCoupleProfile,
  updateDateRecord,
  updateDreamRecord,
} from '@/lib/supabase/services/couple-service'

const emptyProfile: CoupleProfile = {
  partners: [
    { id: '', name: '', initial: '?' },
    { id: '', name: '', initial: '?' },
  ],
  relationshipStartDate: '',
  description: '',
}

export function CoupleProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const session = useCoupleSession()
  const [profile, setProfile] = useState<CoupleProfile>(emptyProfile)
  const [dreams, setDreams] = useState<Dream[]>([])
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0)

  const retry = useCallback(
    async (showLoading = true) => {
      if (!session.couple) {
        setProfile(emptyProfile)
        setDreams([])
        setImportantDates([])
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
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to load relationship data.',
        )
      } finally {
        if (showLoading) setLoading(false)
      }
    },
    [session.couple],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => void retry(), 0)
    return () => window.clearTimeout(timeout)
  }, [retry])

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

  const value = useMemo<CoupleContextValue>(
    () => ({
      profile,
      dreams,
      importantDates,
      loading,
      error,
      uploadingPhoto,
      photoUploadProgress,
      retry,
      updateProfile,
      uploadProfilePhoto,
      removeProfilePhoto,
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
      loading,
      profile,
      photoUploadProgress,
      removeProfilePhoto,
      retry,
      toggleDream,
      updateDream,
      updateProfile,
      uploadProfilePhoto,
      uploadingPhoto,
      updateSpecialDate,
    ],
  )

  return <CoupleContext value={value}>{children}</CoupleContext>
}
