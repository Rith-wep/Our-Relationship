import { Heart } from 'lucide-react'

import { PagePlaceholder } from '@/components/ui/PagePlaceholder'

export function LettersPage() {
  return (
    <PagePlaceholder
      title="Love Letters"
      description="A private place for words meant only for each other."
      emptyTitle="No letters yet"
      emptyDescription="Letters you write and receive will be kept safely here."
      icon={<Heart aria-hidden="true" className="size-5" />}
    />
  )
}
