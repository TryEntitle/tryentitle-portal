import { colors } from '@/lib/theme'

export default function Table({
  columns,
  children,
}: {
  columns: string[]
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.layout.divider}`,
        borderRadius: 12,
        background: colors.layout.surface,
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: colors.default[50], borderBottom: `1px solid ${colors.layout.divider}` }}>
            {columns.map((c) => (
              <th
                key={c}
                style={{ textAlign: 'left', padding: '10px 16px', color: colors.content.muted, fontWeight: 500 }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '12px 16px', borderTop: `1px solid ${colors.default[100]}`, ...style }}>{children}</td>
  )
}
