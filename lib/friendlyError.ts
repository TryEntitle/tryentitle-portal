/** Never surface raw Postgres / Supabase internals to the UI. */
export function friendlyAuthError(raw: string | null | undefined): string {
  const msg = (raw || '').trim()
  if (!msg) return 'Something went wrong. Please try again.'
  const lower = msg.toLowerCase()
  if (
    lower.includes('permission denied') ||
    lower.includes('row-level security') ||
    lower.includes('rls') ||
    lower.includes('jwt') ||
    lower.includes('violates') ||
    lower.includes('schema cache') ||
    lower.includes('column') ||
    lower.includes('relation')
  ) {
    return 'Something went wrong. Please try again.'
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.'
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in.'
  }
  // Keep short user-facing auth messages; drop stack-like or SQL-ish text.
  if (msg.length > 120 || /for table|postgres|sql/i.test(msg)) {
    return 'Something went wrong. Please try again.'
  }
  return msg
}
