import type { ImportantDate } from '@/features/couple/types'

export const demoDates: ImportantDate[] = [
  {
    id: 'date-first-meeting',
    title: 'The day we first met',
    date: '2023-03-18',
    type: 'first_meeting',
    recurringAnnually: true,
    isCustom: false,
  },
  {
    id: 'date-first-date',
    title: 'Our first date',
    date: '2023-04-02',
    type: 'first_date',
    recurringAnnually: true,
    isCustom: false,
  },
  {
    id: 'date-anniversary',
    title: 'Our anniversary',
    date: '2023-05-12',
    type: 'relationship_anniversary',
    recurringAnnually: true,
    isCustom: false,
  },
  {
    id: 'date-demo-birthday',
    title: 'Riley’s birthday',
    date: '1998-11-21',
    type: 'birthday',
    recurringAnnually: true,
    isCustom: false,
  },
]
