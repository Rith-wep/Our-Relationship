export interface DemoPartner {
  name: string
  initial: string
}

export interface DemoCouple {
  partners: [DemoPartner, DemoPartner]
  relationshipStartDate: string
  caption: string
}

export const demoCouple: DemoCouple = {
  partners: [
    { name: 'Alex', initial: 'A' },
    { name: 'Riley', initial: 'R' },
  ],
  relationshipStartDate: '2023-05-12',
  caption:
    'Growing a life from small moments, shared dreams, and choosing each other.',
}
