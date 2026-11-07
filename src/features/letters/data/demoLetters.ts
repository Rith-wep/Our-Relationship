import type { LoveLetter, PartnerIdentity } from '@/features/letters/types'

export const demoPartners: readonly [PartnerIdentity, PartnerIdentity] = [
  { id: 'partner-a', name: 'Alex', initial: 'A' },
  { id: 'partner-b', name: 'Riley', initial: 'R' },
]

export const demoCoupleId = 'demo-couple'

export const demoLetters: LoveLetter[] = [
  {
    id: 'letter-morning-light',
    coupleId: demoCoupleId,
    senderId: 'partner-b',
    recipientId: 'partner-a',
    title: 'The quiet parts of us',
    body: 'I love the adventures we plan, but I think I love our quiet moments even more. The unhurried mornings, the familiar stories, and the way a room feels warmer when you are in it.\n\nThank you for making ordinary life feel like somewhere I always want to return to.',
    status: 'sent',
    createdAt: '2025-01-14T08:20:00.000Z',
    updatedAt: '2025-01-14T08:20:00.000Z',
    sentAt: '2025-01-14T08:20:00.000Z',
    readAt: null,
    favorite: true,
    deletedAt: null,
  },
  {
    id: 'letter-small-things',
    coupleId: demoCoupleId,
    senderId: 'partner-a',
    recipientId: 'partner-b',
    title: 'A list of small things',
    body: 'The laugh you try to hide. The way you remember the details I forget. The pause before you say something important.\n\nThere are a hundred small things I notice and a hundred more I hope I never stop noticing.',
    status: 'sent',
    createdAt: '2025-02-03T18:10:00.000Z',
    updatedAt: '2025-02-04T07:42:00.000Z',
    sentAt: '2025-02-03T18:10:00.000Z',
    readAt: '2025-02-04T07:42:00.000Z',
    favorite: false,
    deletedAt: null,
  },
  {
    id: 'letter-next-adventure',
    coupleId: demoCoupleId,
    senderId: 'partner-a',
    recipientId: 'partner-b',
    title: 'For our next adventure',
    body: 'I have been thinking about all the places we still have not seen and all the versions of us we have not met yet.',
    status: 'draft',
    createdAt: '2025-02-18T11:30:00.000Z',
    updatedAt: '2025-02-18T11:30:00.000Z',
    sentAt: null,
    readAt: null,
    favorite: false,
    deletedAt: null,
  },
  {
    id: 'letter-steady-place',
    coupleId: demoCoupleId,
    senderId: 'partner-b',
    recipientId: 'partner-a',
    title: 'My steady place',
    body: 'When everything feels loud, you are the person who helps the world make sense again.',
    status: 'sent',
    createdAt: '2024-12-08T20:15:00.000Z',
    updatedAt: '2024-12-08T20:15:00.000Z',
    sentAt: '2024-12-08T20:15:00.000Z',
    readAt: '2024-12-09T06:50:00.000Z',
    favorite: false,
    deletedAt: null,
  },
]

export function getPartner(partnerId: string) {
  return demoPartners.find((partner) => partner.id === partnerId)
}

export function getOtherPartner(partnerId: string) {
  return (
    demoPartners.find((partner) => partner.id !== partnerId) ?? demoPartners[1]
  )
}
