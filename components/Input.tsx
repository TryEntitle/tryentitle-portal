import { colors } from '@/lib/theme'

// Shared style for in-app form controls (not the auth screen's pill inputs —
// those stay as the `inputStyle` const already in app/login/page.tsx).
export const fieldStyle: React.CSSProperties = {
  height: 40,
  padding: '0 12px',
  borderRadius: 8,
  border: `1px solid ${colors.default[200]}`,
  fontSize: 14,
  color: colors.content.primary,
  outline: 'none',
  background: colors.layout.surface,
  width: '100%',
  boxSizing: 'border-box',
}

export const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: colors.content.secondary,
  display: 'grid',
  gap: 6,
}

export function TextInput({ style, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} style={{ ...fieldStyle, ...style }} />
}

export function TextArea({ style, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} style={{ ...fieldStyle, height: 'auto', minHeight: 90, padding: 10, resize: 'vertical', ...style }} />
}

export function Select({ style, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} style={{ ...fieldStyle, ...style }} />
}
