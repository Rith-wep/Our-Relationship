import type { LetterBox } from '@/features/letters/view-types'

interface LetterTabsProps {
  selected: LetterBox
  counts: Record<LetterBox, number>
  onChange: (box: LetterBox) => void
}

const tabs: { label: string; value: LetterBox }[] = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Sent', value: 'sent' },
  { label: 'Drafts', value: 'drafts' },
]

export function LetterTabs({ selected, counts, onChange }: LetterTabsProps) {
  return (
    <div
      className="grid grid-cols-3 border-b border-border"
      role="tablist"
      aria-label="Letter boxes"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={selected === tab.value}
          onClick={() => onChange(tab.value)}
          className={[
            'relative min-h-12 border-b-2 px-2 text-sm font-semibold transition-colors motion-reduce:transition-none',
            selected === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary',
          ].join(' ')}
        >
          {tab.label}
          {counts[tab.value] > 0 ? (
            <span className="ml-1 text-[10px] font-medium text-text-muted">
              {counts[tab.value]}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
