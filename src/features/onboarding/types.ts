export interface CoupleMemberIdentity {
  userId: string
  displayName: string
  joinedAt: string
}

export interface CoupleSession {
  coupleId: string
  relationshipStartDate: string | null
  description: string
  members: CoupleMemberIdentity[]
}

export interface InvitationResult {
  invitationId: string
  token: string
  expiresAt: string
  url: string
}

export type InvitationStatus = 'active' | 'accepted' | 'expired' | 'revoked'

export interface InvitationSummary {
  invitationId: string
  recipientEmail: string | null
  expiresAt: string
  createdAt: string
  status: InvitationStatus
}

export interface CoupleActionResult<T = undefined> {
  data?: T
  error: string | null
}
