import { createContext } from 'react'

import type {
  LetterDraftInput,
  LoveLetter,
  PartnerId,
} from '@/features/letters/types'

export interface LettersContextValue {
  letters: LoveLetter[]
  loading: boolean
  error: string | null
  retry: () => Promise<void>
  createDraft: (input: LetterDraftInput) => Promise<void>
  updateDraft: (
    id: string,
    ownerId: PartnerId,
    input: LetterDraftInput,
  ) => Promise<void>
  deleteDraft: (id: string, ownerId: PartnerId) => Promise<void>
  sendLetter: (id: string, ownerId: PartnerId) => Promise<void>
  createAndSendLetter: (input: LetterDraftInput) => Promise<void>
  markAsRead: (id: string, recipientId: PartnerId) => Promise<void>
  toggleFavorite: (id: string, participantId: PartnerId) => Promise<void>
  softDelete: (id: string, participantId: PartnerId) => Promise<void>
  restoreLetter: (id: string, participantId: PartnerId) => Promise<void>
}

export const LettersContext = createContext<LettersContextValue | null>(null)
