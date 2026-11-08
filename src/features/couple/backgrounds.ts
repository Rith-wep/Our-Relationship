import type {
  BackgroundPreference,
  BackgroundPreset,
} from '@/features/couple/types'

export const backgroundPresets: Array<{
  value: Exclude<BackgroundPreset, 'custom'>
  label: string
  color: string
}> = [
  { value: 'default', label: 'Default', color: '#FFFFFF' },
  { value: 'soft_pink', label: 'Soft Pink', color: '#FFF0F7' },
  { value: 'cream', label: 'Cream', color: '#FFF8E7' },
  { value: 'lavender', label: 'Lavender', color: '#F3EEFF' },
  { value: 'sky_blue', label: 'Sky Blue', color: '#EAF6FF' },
  { value: 'dark_romantic', label: 'Dark Romantic', color: '#251923' },
]

export const defaultBackground: BackgroundPreference = { preset: 'default' }

export function isValidHexColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}

export function backgroundColor(preference: BackgroundPreference) {
  if (
    preference.preset === 'custom' &&
    preference.customColor &&
    isValidHexColor(preference.customColor)
  ) {
    return preference.customColor.toUpperCase()
  }

  return (
    backgroundPresets.find((item) => item.value === preference.preset)?.color ??
    '#FFFFFF'
  )
}

export function isDarkBackground(color: string) {
  const normalized = color.replace('#', '')
  if (normalized.length !== 6) return false
  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(normalized.slice(index, index + 2), 16),
  )
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000
  return luminance < 128
}

export function applyBackgroundPreference(preference: BackgroundPreference) {
  const color = backgroundColor(preference)
  const root = document.documentElement
  root.dataset.appBackground = preference.preset
  root.dataset.appBackgroundDark = String(isDarkBackground(color))
  root.style.setProperty('--custom-app-background', color)
}
