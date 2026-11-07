const dayMs = 86_400_000

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
    ? date
    : null
}

function monthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function dayNumber(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / dayMs
}

export function nextDateOccurrence(
  value: string,
  recurring: boolean,
  now = new Date(),
) {
  const original = parseDate(value)
  if (!original) return null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let occurrence = original

  if (recurring) {
    const create = (year: number) =>
      new Date(
        year,
        original.getMonth(),
        Math.min(original.getDate(), monthDays(year, original.getMonth())),
      )
    occurrence = create(today.getFullYear())
    if (occurrence < today) occurrence = create(today.getFullYear() + 1)
  }

  return {
    date: occurrence,
    daysRemaining: Math.round(dayNumber(occurrence) - dayNumber(today)),
  }
}
