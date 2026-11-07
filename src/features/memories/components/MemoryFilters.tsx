import type { MemoryFilter } from '@/features/memories/types'

interface MemoryFiltersProps {
  selected: MemoryFilter
  onChange: (filter: MemoryFilter) => void
}

const filters: { label: string; value: MemoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Photos', value: 'photos' },
  { label: 'Milestones', value: 'milestones' },
  { label: 'Favorites', value: 'favorites' },
]

export function MemoryFilters({ selected, onChange }: MemoryFiltersProps) {
  return (
    <div
      aria-label="Filter memories"
      className="-mx-1 overflow-x-auto px-1 pb-1"
    >
      <div className="flex min-w-max gap-2" role="group">
        {filters.map((filter) => {
          const isSelected = filter.value === selected
          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(filter.value)}
              className={[
                'min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors motion-reduce:transition-none',
                isSelected
                  ? 'border-border-strong bg-primary text-white'
                  : 'border-border-strong bg-card text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
