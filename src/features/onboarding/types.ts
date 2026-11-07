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

export interface CoupleActionResult<T = undefined> {
  data?: T
  error: string | null
}
