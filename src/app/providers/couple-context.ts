import { createContext } from 'react'

import type {
  CoupleProfile,
  Dream,
  DreamDraft,
  ImportantDate,
  SpecialDateDraft,
} from '@/features/couple/types'

export interface CoupleContextValue {
  profile: CoupleProfile
  dreams: Dream[]
  importantDates: ImportantDate[]
  updateProfile: (profile: CoupleProfile) => void
  createDream: (draft: DreamDraft) => void
  updateDream: (id: string, draft: DreamDraft) => void
  toggleDream: (id: string) => void
  deleteDream: (id: string) => void
  createSpecialDate: (draft: SpecialDateDraft) => void
  updateSpecialDate: (id: string, draft: SpecialDateDraft) => void
  deleteSpecialDate: (id: string) => void
}

export const CoupleContext = createContext<CoupleContextValue | null>(null)
