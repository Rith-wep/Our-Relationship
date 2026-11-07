import { UserRound } from 'lucide-react'

import { PagePlaceholder } from '@/components/ui/PagePlaceholder'

export function CouplePage() {
  return (
    <PagePlaceholder
      title="Us"
      description="Your relationship details and shared plans, all in one place."
      emptyTitle="Your space is ready to grow"
      emptyDescription="Couple details, important dates, and shared goals will live here."
      icon={<UserRound aria-hidden="true" className="size-5" />}
    />
  )
}
