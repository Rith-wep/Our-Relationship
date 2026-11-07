export type LetterStatus = 'draft' | 'sent'
export type PartnerId = 'partner-a' | 'partner-b'

export interface PartnerIdentity {
  id: PartnerId
  name: string
  initial: string
}

export interface LoveLetter {
  id: string
  coupleId: string
  senderId: PartnerId
  recipientId: PartnerId
  title: string
  body: string
  status: LetterStatus
  createdAt: string
  updatedAt: string
  sentAt: string | null
  readAt: string | null
  favorite: boolean
  deletedAt: string | null
}

export interface LetterDraftInput {
  title: string
  body: string
  senderId: PartnerId
  recipientId: PartnerId
}
