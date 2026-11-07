import { type ReactNode, useCallback, useMemo, useState } from 'react'

import {
  LettersContext,
  type LettersContextValue,
} from '@/app/providers/letters-context'
import { demoCoupleId, demoLetters } from '@/features/letters/data/demoLetters'
import type {
  LetterDraftInput,
  LoveLetter,
  PartnerId,
} from '@/features/letters/types'

interface LettersProviderProps {
  children: ReactNode
}

function isParticipant(letter: LoveLetter, partnerId: PartnerId) {
  return letter.senderId === partnerId || letter.recipientId === partnerId
}

export function LettersProvider({ children }: LettersProviderProps) {
  const [letters, setLetters] = useState<LoveLetter[]>(demoLetters)

  const createDraft = useCallback((input: LetterDraftInput) => {
    const now = new Date().toISOString()
    const letter: LoveLetter = {
      ...input,
      id: crypto.randomUUID(),
      coupleId: demoCoupleId,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      sentAt: null,
      readAt: null,
      favorite: false,
      deletedAt: null,
    }
    setLetters((current) => [...current, letter])
    return letter
  }, [])

  const updateDraft = useCallback(
    (id: string, ownerId: PartnerId, input: LetterDraftInput) => {
      const updatedAt = new Date().toISOString()
      setLetters((current) =>
        current.map((letter) => {
          if (
            letter.id !== id ||
            letter.senderId !== ownerId ||
            letter.status !== 'draft' ||
            letter.deletedAt
          ) {
            return letter
          }
          return { ...letter, ...input, senderId: ownerId, updatedAt }
        }),
      )
    },
    [],
  )

  const softDelete = useCallback((id: string, participantId: PartnerId) => {
    const deletedAt = new Date().toISOString()
    setLetters((current) =>
      current.map((letter) =>
        letter.id === id &&
        isParticipant(letter, participantId) &&
        !letter.deletedAt
          ? { ...letter, deletedAt, updatedAt: deletedAt }
          : letter,
      ),
    )
  }, [])

  const deleteDraft = useCallback((id: string, ownerId: PartnerId) => {
    const deletedAt = new Date().toISOString()
    setLetters((current) =>
      current.map((letter) =>
        letter.id === id &&
        letter.senderId === ownerId &&
        letter.status === 'draft' &&
        !letter.deletedAt
          ? { ...letter, deletedAt, updatedAt: deletedAt }
          : letter,
      ),
    )
  }, [])

  const sendLetter = useCallback((id: string, ownerId: PartnerId) => {
    const sentAt = new Date().toISOString()
    setLetters((current) =>
      current.map((letter) => {
        if (
          letter.id !== id ||
          letter.senderId !== ownerId ||
          letter.status !== 'draft' ||
          letter.deletedAt ||
          !letter.title.trim() ||
          !letter.body.trim()
        ) {
          return letter
        }
        return { ...letter, status: 'sent', sentAt, updatedAt: sentAt }
      }),
    )
  }, [])

  const createAndSendLetter = useCallback((input: LetterDraftInput) => {
    const now = new Date().toISOString()
    const letter: LoveLetter = {
      ...input,
      id: crypto.randomUUID(),
      coupleId: demoCoupleId,
      status: 'sent',
      createdAt: now,
      updatedAt: now,
      sentAt: now,
      readAt: null,
      favorite: false,
      deletedAt: null,
    }
    setLetters((current) => [...current, letter])
    return letter
  }, [])

  const markAsRead = useCallback((id: string, recipientId: PartnerId) => {
    const readAt = new Date().toISOString()
    setLetters((current) =>
      current.map((letter) =>
        letter.id === id &&
        letter.recipientId === recipientId &&
        letter.status === 'sent' &&
        !letter.readAt &&
        !letter.deletedAt
          ? { ...letter, readAt, updatedAt: readAt }
          : letter,
      ),
    )
  }, [])

  const toggleFavorite = useCallback((id: string, participantId: PartnerId) => {
    const updatedAt = new Date().toISOString()
    setLetters((current) =>
      current.map((letter) =>
        letter.id === id &&
        isParticipant(letter, participantId) &&
        !letter.deletedAt
          ? { ...letter, favorite: !letter.favorite, updatedAt }
          : letter,
      ),
    )
  }, [])

  const restoreLetter = useCallback((id: string, participantId: PartnerId) => {
    const updatedAt = new Date().toISOString()
    setLetters((current) =>
      current.map((letter) =>
        letter.id === id &&
        isParticipant(letter, participantId) &&
        letter.deletedAt
          ? { ...letter, deletedAt: null, updatedAt }
          : letter,
      ),
    )
  }, [])

  const value = useMemo<LettersContextValue>(
    () => ({
      letters,
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
      letters,
      markAsRead,
      restoreLetter,
      sendLetter,
      softDelete,
      toggleFavorite,
      updateDraft,
    ],
  )

  return <LettersContext value={value}>{children}</LettersContext>
}
