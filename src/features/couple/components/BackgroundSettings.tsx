import { Check } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import {
  applyBackgroundPreference,
  backgroundColor,
  backgroundPresets,
  isValidHexColor,
} from '@/features/couple/backgrounds'
import type { BackgroundPreference } from '@/features/couple/types'

export function BackgroundSettings({
  value,
  onCancel,
  onSave,
}: {
  value: BackgroundPreference
  onCancel: () => void
  onSave: (preference: BackgroundPreference) => void
}) {
  const [draft, setDraft] = useState(value)
  const [customColor, setCustomColor] = useState(value.customColor ?? '#FDE7F3')

  const preview = (preference: BackgroundPreference) => {
    setDraft(preference)
    applyBackgroundPreference(preference)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const preference =
      draft.preset === 'custom'
        ? { preset: 'custom' as const, customColor: customColor.toUpperCase() }
        : draft
    if (preference.preset === 'custom' && !isValidHexColor(customColor)) return
    onSave(preference)
  }

  return (
    <form onSubmit={submit} className="flex max-h-[calc(90dvh-4rem)] flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <fieldset>
          <legend className="sr-only">Choose application background</legend>
          <div className="grid grid-cols-2 gap-3">
            {backgroundPresets.map((preset) => {
              const selected = draft.preset === preset.value
              return (
                <button
                  key={preset.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => preview({ preset: preset.value })}
                  className={`relative flex min-h-20 items-end overflow-hidden rounded-card border p-3 text-left text-sm font-semibold shadow-sm transition ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border-strong'}`}
                  style={{
                    backgroundColor: preset.color,
                    color:
                      preset.value === 'dark_romantic' ? '#FFFFFF' : '#1F2937',
                  }}
                >
                  {preset.label}
                  {selected ? (
                    <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-white">
                      <Check aria-hidden="true" className="size-4" />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-4 rounded-card border border-border-strong bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="custom-background"
              className="text-sm font-semibold"
            >
              Custom color
            </label>
            <input
              id="custom-background"
              type="color"
              value={customColor}
              aria-label="Custom application background color"
              onChange={(event) => {
                const color = event.target.value.toUpperCase()
                setCustomColor(color)
                preview({ preset: 'custom', customColor: color })
              }}
              className="h-11 w-16 cursor-pointer rounded-control border border-border-strong bg-card p-1"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              preview({
                preset: 'custom',
                customColor: customColor.toUpperCase(),
              })
            }
            className={`mt-3 flex min-h-11 w-full items-center justify-between rounded-control border px-3 text-sm font-medium ${draft.preset === 'custom' ? 'border-primary ring-2 ring-primary/20' : 'border-border-strong'}`}
          >
            <span>Use {customColor.toUpperCase()}</span>
            <span
              aria-hidden="true"
              className="size-6 rounded-full border border-black/10"
              style={{ backgroundColor: customColor }}
            />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-control bg-surface p-3">
          <span
            aria-hidden="true"
            className="size-9 shrink-0 rounded-full border border-black/10 shadow-sm"
            style={{ backgroundColor: backgroundColor(draft) }}
          />
          <p className="text-xs leading-5 text-text-secondary">
            Shared with both partners. Dark mode keeps its current background.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          Save
        </Button>
      </div>
    </form>
  )
}
