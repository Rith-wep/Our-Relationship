import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  LettersContext,
  type LettersContextValue,
} from '@/app/providers/letters-context'
import { useAuth } from '@/features/auth/useAuth'
import type { LetterDraftInput, LoveLetter } from '@/features/letters/types'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'
import {
  createDraftRecord,
  deleteDraftRecord,
  loadLetters,
  markLetterRead,
  sendLetterRecord,
  setLetterDeleted,
  setLetterFavorite,
  updateDraftRecord,
} from '@/lib/supabase/services/letters-service'

export function LettersProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const session = useCoupleSession()
  const [letters, setLetters] = useState<LoveLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const memberNames = useMemo(
    () =>
      new Map(
        session.couple?.members.map((member) => [
          member.userId,
          member.displayName,
        ]) ?? [],
      ),
    [session.couple],
  )

  const retry = useCallback(
    async (showLoading = true) => {
      if (!session.couple || !auth.user) {
        setLetters([])
        setLoading(false)
        return
      }
      if (showLoading) setLoading(true)
      setError(null)
      try {
        setLetters(
          await loadLetters(session.couple.coupleId, auth.user.id, memberNames),
        )
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'Unable to load letters.',
        )
      } finally {
        if (showLoading) setLoading(false)
      }
    },
    [auth.user, memberNames, session.couple],
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
        setError(
          caught instanceof Error ? caught.message : 'Letter update failed.',
        )
      }
    },
    [retry],
  )

  const participantIds = useCallback(() => {
    if (!session.couple || !auth.user) throw new Error('Not signed in.')
    const recipient = session.couple.members.find(
      (member) => member.userId !== auth.user?.id,
    )
    if (!recipient) throw new Error('Your partner has not joined yet.')
    return {
      coupleId: session.couple.coupleId,
      senderId: auth.user.id,
      recipientId: recipient.userId,
    }
  }, [auth.user, session.couple])

  const createDraft = useCallback(
    (input: LetterDraftInput) =>
      runMutation(async () => {
        const ids = participantIds()
        await createDraftRecord(
          ids.coupleId,
          ids.senderId,
          ids.recipientId,
          input,
        )
      }),
    [participantIds, runMutation],
  )

  const updateDraft = useCallback(
    (id: string, _ownerId: string, input: LetterDraftInput) =>
      runMutation(() => updateDraftRecord(id, input)),
    [runMutation],
  )

  const deleteDraft = useCallback(
    (id: string) => runMutation(() => deleteDraftRecord(id)),
    [runMutation],
  )

  const sendLetter = useCallback(
    (id: string) => runMutation(() => sendLetterRecord(id)),
    [runMutation],
  )

  const createAndSendLetter = useCallback(
    (input: LetterDraftInput) =>
      runMutation(async () => {
        const ids = participantIds()
        const draft = await createDraftRecord(
          ids.coupleId,
          ids.senderId,
          ids.recipientId,
          input,
        )
        await sendLetterRecord(draft.id)
      }),
    [participantIds, runMutation],
  )

  const markAsRead = useCallback(
    (id: string) => runMutation(() => markLetterRead(id)),
    [runMutation],
  )

  const toggleFavorite = useCallback(
    (id: string) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        const letter = letters.find((item) => item.id === id)
        if (!letter) throw new Error('Letter was not found.')
        await setLetterFavorite(id, auth.user.id, !letter.favorite)
      }),
    [auth.user, letters, runMutation],
  )

  const softDelete = useCallback(
    (id: string) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        await setLetterDeleted(id, auth.user.id, true)
      }),
    [auth.user, runMutation],
  )

  const restoreLetter = useCallback(
    (id: string) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        await setLetterDeleted(id, auth.user.id, false)
      }),
    [auth.user, runMutation],
  )

  const value = useMemo<LettersContextValue>(
    () => ({
      letters,
      loading,
      error,
      retry,
      createDraft,
      updateDraft,
      deleteDraft,
      sendLetter,
      createAndSendLetter,
      markAsRead,
      toggleFavorite,
      softDelete,
      restoreLetter,
    }),
    [
      createAndSendLetter,
      createDraft,
      deleteDraft,
      error,
      letters,
      loading,
      markAsRead,
      restoreLetter,
      retry,
      sendLetter,
      softDelete,
      toggleFavorite,
      updateDraft,
    ],
  )

  return <LettersContext value={value}>{children}</LettersContext>
}
