import { Images } from 'lucide-react'

import { PagePlaceholder } from '@/components/ui/PagePlaceholder'

export function MemoriesPage() {
  return (
    <PagePlaceholder
      title="Memories"
      description="A private collection of the photos and moments you share."
      emptyTitle="No memories added yet"
      emptyDescription="Your shared photos, videos, and albums will be collected here."
      icon={<Images aria-hidden="true" className="size-5" />}
    />
  )
}
