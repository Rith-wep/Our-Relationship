import { createContext } from 'react'

import type {
  CoupleActionResult,
  CoupleSession,
  InvitationResult,
  InvitationSummary,
} from '@/features/onboarding/types'

export interface CoupleSessionContextValue {
  couple: CoupleSession | null
  displayName: string | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createSpace: (input: {
    displayName: string
    relationshipDate: string | null
    description: string
    recipientEmail: string
  }) => Promise<CoupleActionResult<InvitationResult>>
  acceptInvitation: (
    token: string,
    displayName: string,
  ) => Promise<CoupleActionResult>
  createInvitation: (
    recipientEmail: string,
  ) => Promise<CoupleActionResult<InvitationResult>>
  listInvitations: () => Promise<CoupleActionResult<InvitationSummary[]>>
  revokeInvitation: (invitationId: string) => Promise<CoupleActionResult>
}

export const CoupleSessionContext =
  createContext<CoupleSessionContextValue | null>(null)
