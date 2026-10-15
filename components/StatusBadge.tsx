const COLORS: Record<string, { bg: string; fg: string }> = {
  new: { bg: '#eef2ff', fg: '#4338ca' },
  'in progress': { bg: '#fff7ed', fg: '#c2410c' },
  completed: { bg: '#ecfdf5', fg: '#047857' },
  cancelled: { bg: '#fef2f2', fg: '#b91c1c' },
}

export default function StatusBadge({ status }: { status: string }) {
  const c = COLORS[status?.toLowerCase()] ?? { bg: '#f3f4f6', fg: '#374151' }
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: 999,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  )
}
