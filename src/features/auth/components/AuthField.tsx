import type { ComponentProps } from 'react'

export function AuthField({
  label,
  ...props
}: ComponentProps<'input'> & { label: string }) {
  const id = props.id ?? props.name
  return (
    <label className="block" htmlFor={id}>
      <span className="form-label">{label}</span>
      <input {...props} id={id} className="form-control disabled:opacity-60" />
    </label>
  )
}
