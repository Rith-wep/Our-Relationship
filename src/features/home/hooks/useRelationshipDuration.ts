import { useEffect, useMemo, useState } from 'react'

export interface RelationshipDuration {
  status: 'active' | 'future' | 'invalid'
  totalDays: number
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface AnniversaryDetails {
  monthlyDate: Date
  monthlyDaysRemaining: number
  yearlyDate: Date
  yearlyDaysRemaining: number
}

const millisecondsPerDay = 86_400_000

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function createClampedDate(year: number, month: number, preferredDay: number) {
  return new Date(year, month, Math.min(preferredDay, daysInMonth(year, month)))
}

function parseLocalDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function calendarDayNumber(date: Date) {
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
    millisecondsPerDay
  )
}

function calculateDuration(
  startDate: Date | null,
  now: Date,
): RelationshipDuration {
  const empty: RelationshipDuration = {
    status: startDate ? 'future' : 'invalid',
    totalDays: 0,
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  }

  if (!startDate) return empty
  if (now.getTime() < startDate.getTime()) return empty

  let years = now.getFullYear() - startDate.getFullYear()
  let cursor = createClampedDate(
    startDate.getFullYear() + years,
    startDate.getMonth(),
    startDate.getDate(),
  )

  if (cursor.getTime() > now.getTime()) {
    years -= 1
    cursor = createClampedDate(
      startDate.getFullYear() + years,
      startDate.getMonth(),
      startDate.getDate(),
    )
  }

  let months = 0
  while (months < 11) {
    const nextMonthIndex = cursor.getMonth() + 1
    const candidate = createClampedDate(
      cursor.getFullYear() + Math.floor(nextMonthIndex / 12),
      nextMonthIndex % 12,
      startDate.getDate(),
    )
    if (candidate.getTime() > now.getTime()) break
    cursor = candidate
    months += 1
  }

  const days = Math.max(0, calendarDayNumber(now) - calendarDayNumber(cursor))
  const elapsedToday =
    now.getHours() * 3_600_000 +
    now.getMinutes() * 60_000 +
    now.getSeconds() * 1000 +
    now.getMilliseconds()

  return {
    status: 'active',
    totalDays: Math.max(
      0,
      calendarDayNumber(now) - calendarDayNumber(startDate),
    ),
    years,
    months,
    days,
    hours: Math.floor(elapsedToday / 3_600_000),
    minutes: Math.floor((elapsedToday % 3_600_000) / 60_000),
    seconds: Math.floor((elapsedToday % 60_000) / 1000),
  }
}

export function calculateAnniversaries(
  relationshipStartDate: string,
  now = new Date(),
): AnniversaryDetails | null {
  const startDate = parseLocalDate(relationshipStartDate)
  if (!startDate) return null

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (startDate.getTime() > today.getTime()) {
    const daysUntilStart = Math.max(
      0,
      calendarDayNumber(startDate) - calendarDayNumber(today),
    )
    return {
      monthlyDate: startDate,
      monthlyDaysRemaining: daysUntilStart,
      yearlyDate: startDate,
      yearlyDaysRemaining: daysUntilStart,
    }
  }

  let monthlyDate = createClampedDate(
    today.getFullYear(),
    today.getMonth(),
    startDate.getDate(),
  )

  if (monthlyDate.getTime() < today.getTime()) {
    monthlyDate = createClampedDate(
      today.getFullYear() + Math.floor((today.getMonth() + 1) / 12),
      (today.getMonth() + 1) % 12,
      startDate.getDate(),
    )
  }

  let yearlyDate = createClampedDate(
    today.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  )
  if (yearlyDate.getTime() < today.getTime()) {
    yearlyDate = createClampedDate(
      today.getFullYear() + 1,
      startDate.getMonth(),
      startDate.getDate(),
    )
  }

  return {
    monthlyDate,
    monthlyDaysRemaining: Math.max(
      0,
      calendarDayNumber(monthlyDate) - calendarDayNumber(today),
    ),
    yearlyDate,
    yearlyDaysRemaining: Math.max(
      0,
      calendarDayNumber(yearlyDate) - calendarDayNumber(today),
    ),
  }
}

export function useRelationshipDuration(relationshipStartDate: string) {
  const startDate = useMemo(
    () => parseLocalDate(relationshipStartDate),
    [relationshipStartDate],
  )
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return calculateDuration(startDate, now)
}
