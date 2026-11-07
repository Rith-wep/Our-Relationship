import type { Dream } from '@/features/couple/types'

export const demoDreams: Dream[] = [
  {
    id: 'dream-train-coast',
    title: 'Take a slow train along the coast',
    description:
      'Choose the window seats, pack snacks, and stop wherever feels interesting.',
    category: 'travel',
    targetDate: '2027-03-01',
    completed: false,
    createdAt: '2025-01-08T10:00:00.000Z',
    updatedAt: '2025-01-08T10:00:00.000Z',
  },
  {
    id: 'dream-cooking',
    title: 'Learn one signature dish together',
    description: 'Something comforting enough to become our tradition.',
    category: 'food',
    completed: false,
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2025-01-12T10:00:00.000Z',
  },
  {
    id: 'dream-sunrise',
    title: 'Watch a sunrise from somewhere new',
    description: 'Completed on a quiet hill with coffee in a shared flask.',
    category: 'experiences',
    completed: true,
    createdAt: '2024-08-20T10:00:00.000Z',
    updatedAt: '2025-02-02T07:00:00.000Z',
  },
]
