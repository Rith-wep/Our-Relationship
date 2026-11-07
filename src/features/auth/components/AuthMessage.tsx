export function AuthMessage({
  children,
  tone = 'error',
}: {
  children: string
  tone?: 'error' | 'success'
}) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-control px-3 py-2.5 text-sm ${
        tone === 'error'
          ? 'bg-primary-soft text-primary-strong'
          : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      {children}
    </p>
  )
}
