import { House } from 'lucide-react'

import { PagePlaceholder } from '@/components/ui/PagePlaceholder'

export function HomePage() {
  return (
    <PagePlaceholder
      title="Home"
      description="A quiet place for the moments that matter to both of you."
      emptyTitle="Your shared home is taking shape"
      emptyDescription="Relationship highlights and recent memories will live here."
      icon={<House aria-hidden="true" className="size-5" />}
    />
  )
}
