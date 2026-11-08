export interface CouplePartner {
  id: string
  name: string
  initial: string
  photo?: string
  photoPath?: string
  city?: string
  country?: string
  timezone?: string
}

export type BackgroundPreset =
  | 'default'
  | 'soft_pink'
  | 'cream'
  | 'lavender'
  | 'sky_blue'
  | 'dark_romantic'
  | 'custom'

export interface BackgroundPreference {
  preset: BackgroundPreset
  customColor?: string
}

export interface CoupleProfile {
  partners: [CouplePartner, CouplePartner]
  relationshipStartDate: string
  description: string
  nextTimeTogether: string
  background: BackgroundPreference
}

export interface ThinkingOfYou {
  id: string
  senderId: string
  senderName: string
  createdAt: string
}

export type DreamCategory =
  'travel' | 'experiences' | 'food' | 'personal_goals' | 'other'

export interface Dream {
  id: string
  title: string
  description: string
  category: DreamCategory
  targetDate?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type ImportantDateType =
  | 'first_meeting'
  | 'first_date'
  | 'relationship_anniversary'
  | 'birthday'
  | 'custom'

export interface ImportantDate {
  id: string
  title: string
  date: string
  type: ImportantDateType
  recurringAnnually: boolean
  isCustom: boolean
}

export type DreamDraft = Pick<
  Dream,
  'title' | 'description' | 'category' | 'targetDate'
>
export type SpecialDateDraft = Pick<
  ImportantDate,
  'title' | 'date' | 'recurringAnnually'
>
