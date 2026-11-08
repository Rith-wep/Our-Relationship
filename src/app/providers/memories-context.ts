import { createContext } from 'react'

import type { MemoryDraft, TimelineMemory } from '@/features/timeline/types'
import type { RealtimeState } from '@/lib/supabase/useRealtimeSubscription'

export interface MemoriesContextValue {
  memories: TimelineMemory[]
  activeMemories: TimelineMemory[]
  deletedMemories: TimelineMemory[]
  loading: boolean
  error: string | null
  uploading: boolean
  uploadProgress: number
  fullyLoaded: boolean
  realtimeState: RealtimeState
  retry: () => Promise<void>
  loadAll: () => Promise<void>
  createMemory: (draft: MemoryDraft) => Promise<void>
  updateMemory: (id: string, draft: MemoryDraft) => Promise<void>
  deleteMemory: (id: string) => Promise<void>
  restoreMemory: (id: string) => Promise<void>
  permanentlyDeleteMemory: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
}

export const MemoriesContext = createContext<MemoriesContextValue | null>(null)
