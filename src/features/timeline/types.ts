export const milestoneTypes = [
  'first_meeting',
  'first_conversation',
  'first_date',
  'relationship_started',
  'anniversary',
  'special_memory',
  'custom_event',
] as const

export type MilestoneType = (typeof milestoneTypes)[number]

export interface MemoryPhoto {
  src: string
  alt: string
}

export interface MemoryMedia extends MemoryPhoto {
  id: string
  objectPath: string
  mediaType: 'image' | 'video'
  mimeType: string
  sizeBytes: number
}

export interface TimelineMemory {
  id: string
  title: string
  description: string
  date: string
  photo?: MemoryPhoto
  media: MemoryMedia[]
  milestoneType: MilestoneType
  createdBy: string
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  deletedAt?: string
  deletedBy?: string
}

export interface MemoryDraft {
  title: string
  description: string
  date: string
  mediaFile?: File
  removeMedia?: boolean
  milestoneType: MilestoneType
}
