export interface ProfileRow {
  id: string
  display_name: string
  avatar_path: string | null
  avatar_mime_type: string | null
  avatar_size_bytes: number | null
  created_at: string
  updated_at: string
}

export interface MemoryMediaRow {
  id: string
  couple_id: string
  memory_id: string
  object_path: string
  media_type: 'image' | 'video'
  mime_type: string
  file_size_bytes: number
  uploaded_by: string
  created_at: string
}

export interface CoupleRow {
  id: string
  created_by: string
  relationship_start_date: string | null
  description: string
  created_at: string
  updated_at: string
}

export interface MemoryRow {
  id: string
  couple_id: string
  created_by: string
  updated_by: string
  title: string
  description: string
  event_date: string
  milestone_type:
    | 'first_meeting'
    | 'first_conversation'
    | 'first_date'
    | 'relationship_started'
    | 'anniversary'
    | 'special_memory'
    | 'custom_event'
  is_favorite: boolean
  deleted_at: string | null
  deleted_by: string | null
  created_at: string
  updated_at: string
}

export interface DreamRow {
  id: string
  couple_id: string
  title: string
  description: string
  category: 'travel' | 'experiences' | 'food' | 'personal_goals' | 'other'
  target_date: string | null
  is_completed: boolean
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export interface ImportantDateRow {
  id: string
  couple_id: string
  title: string
  event_type:
    | 'first_meeting'
    | 'first_date'
    | 'relationship_anniversary'
    | 'birthday'
    | 'custom'
  event_date: string
  recurs_annually: boolean
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export interface LoveLetterRow {
  id: string
  couple_id: string
  sender_id: string
  recipient_id: string
  title: string
  body: string
  status: 'draft' | 'sent'
  sent_at: string | null
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface MailboxRow {
  couple_id: string
  letter_id: string
  user_id: string
  is_favorite: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ServiceResult<T> {
  data: T | null
  error: { message: string } | null
}

export function asServiceResult<T>(value: unknown) {
  return value as ServiceResult<T>
}
