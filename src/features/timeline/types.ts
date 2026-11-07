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

export interface TimelineMemory {
  id: string
  title: string
  description: string
  date: string
  photo?: MemoryPhoto
  milestoneType: MilestoneType
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface MemoryDraft {
  title: string
  description: string
  date: string
  photo?: MemoryPhoto
  milestoneType: MilestoneType
}
