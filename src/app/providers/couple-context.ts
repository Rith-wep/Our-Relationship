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
  loading: boolean
  error: string | null
  uploadingPhoto: boolean
  photoUploadProgress: number
  retry: () => Promise<void>
  updateProfile: (profile: CoupleProfile) => Promise<void>
  uploadProfilePhoto: (file: File) => Promise<void>
  removeProfilePhoto: () => Promise<void>
  createDream: (draft: DreamDraft) => Promise<void>
  updateDream: (id: string, draft: DreamDraft) => Promise<void>
  toggleDream: (id: string) => Promise<void>
  deleteDream: (id: string) => Promise<void>
  createSpecialDate: (draft: SpecialDateDraft) => Promise<void>
  updateSpecialDate: (id: string, draft: SpecialDateDraft) => Promise<void>
  deleteSpecialDate: (id: string) => Promise<void>
}

export const CoupleContext = createContext<CoupleContextValue | null>(null)
