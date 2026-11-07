import type { ReactNode } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

interface PagePlaceholderProps {
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  icon: ReactNode
}

export function PagePlaceholder({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon,
}: PagePlaceholderProps) {
  return (
    <section className="py-2">
      <PageHeader title={title} description={description} />
      <Card className="mt-8">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={icon}
        />
      </Card>
    </section>
  )
}
