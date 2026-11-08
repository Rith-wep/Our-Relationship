import { createContext } from 'react'

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
import type { RealtimeState } from '@/lib/supabase/useRealtimeSubscription'

export interface CoupleContextValue {
  profile: CoupleProfile
  dreams: Dream[]
  importantDates: ImportantDate[]
  latestThinkingOfYou: ThinkingOfYou | null
  loading: boolean
  error: string | null
  uploadingPhoto: boolean
  photoUploadProgress: number
  realtimeState: RealtimeState
  retry: () => Promise<void>
  updateProfile: (profile: CoupleProfile) => Promise<void>
  updateConnection: (settings: ConnectionSettingsDraft) => Promise<void>
  updateBackground: (preference: BackgroundPreference) => Promise<void>
  uploadProfilePhoto: (file: File) => Promise<void>
  removeProfilePhoto: () => Promise<void>
  sendThinkingOfYou: () => Promise<void>
  createDream: (draft: DreamDraft) => Promise<void>
  updateDream: (id: string, draft: DreamDraft) => Promise<void>
  toggleDream: (id: string) => Promise<void>
  deleteDream: (id: string) => Promise<void>
  createSpecialDate: (draft: SpecialDateDraft) => Promise<void>
  updateSpecialDate: (id: string, draft: SpecialDateDraft) => Promise<void>
  deleteSpecialDate: (id: string) => Promise<void>
}

export const CoupleContext = createContext<CoupleContextValue | null>(null)
