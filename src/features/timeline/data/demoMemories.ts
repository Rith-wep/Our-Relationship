import cafeWindow from '@/features/timeline/assets/cafe-window.svg'
import eveningWalk from '@/features/timeline/assets/evening-walk.svg'
import trainJourney from '@/features/timeline/assets/train-journey.svg'
import type { TimelineMemory } from '@/features/timeline/types'

export const demoMemories: TimelineMemory[] = [
  {
    id: 'demo-first-conversation',
    title: 'The conversation that ran late',
    description:
      'A quick hello turned into hours of stories, tiny coincidences, and the comfortable feeling that there was still so much left to say.',
    date: '2023-03-18',
    photo: {
      src: cafeWindow,
      alt: 'Abstract illustration of a warm café window',
    },
    milestoneType: 'first_conversation',
    createdBy: 'Demo partner',
    createdAt: '2023-03-19T09:30:00.000Z',
    updatedAt: '2023-03-19T09:30:00.000Z',
    isFavorite: true,
  },
  {
    id: 'demo-first-date',
    title: 'An unhurried evening walk',
    description:
      'The plan was simple: take a short walk before sunset. We missed the turn home, found a quiet park, and decided getting a little lost was the best part.',
    date: '2023-04-02',
    photo: {
      src: eveningWalk,
      alt: 'Abstract illustration of a park path at sunset',
    },
    milestoneType: 'first_date',
    createdBy: 'Demo partner',
    createdAt: '2023-04-03T08:15:00.000Z',
    updatedAt: '2023-04-03T08:15:00.000Z',
    isFavorite: false,
  },
  {
    id: 'demo-relationship-started',
    title: 'We chose us',
    description:
      'A small, certain moment when two separate stories officially became one shared adventure.',
    date: '2023-05-12',
    milestoneType: 'relationship_started',
    createdBy: 'Demo partner',
    createdAt: '2023-05-12T18:45:00.000Z',
    updatedAt: '2023-05-12T18:45:00.000Z',
    isFavorite: true,
  },
  {
    id: 'demo-special-trip',
    title: 'The window-seat adventure',
    description:
      'A spontaneous train ride, shared snacks, and a landscape neither of us had seen before. Nothing grand was planned, which made every stop feel like a discovery.',
    date: '2023-08-26',
    photo: {
      src: trainJourney,
      alt: 'Abstract illustration of hills through a train window',
    },
    milestoneType: 'special_memory',
    createdBy: 'Demo partner',
    createdAt: '2023-08-27T10:00:00.000Z',
    updatedAt: '2023-08-27T10:00:00.000Z',
    isFavorite: false,
  },
]
