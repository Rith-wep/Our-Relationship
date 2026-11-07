import { createContext } from 'react'

import type {
  LetterDraftInput,
  LoveLetter,
  PartnerId,
} from '@/features/letters/types'

export interface LettersContextValue {
  letters: LoveLetter[]
  createDraft: (input: LetterDraftInput) => LoveLetter
  updateDraft: (id: string, ownerId: PartnerId, input: LetterDraftInput) => void
  deleteDraft: (id: string, ownerId: PartnerId) => void
  sendLetter: (id: string, ownerId: PartnerId) => void
  createAndSendLetter: (input: LetterDraftInput) => LoveLetter
  markAsRead: (id: string, recipientId: PartnerId) => void
  toggleFavorite: (id: string, participantId: PartnerId) => void
  softDelete: (id: string, participantId: PartnerId) => void
  restoreLetter: (id: string, participantId: PartnerId) => void
}

export const LettersContext = createContext<LettersContextValue | null>(null)
