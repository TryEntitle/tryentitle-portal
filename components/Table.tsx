export default function Table({
  columns,
  children,
}: {
  columns: string[]
  children: React.ReactNode
}) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
            {columns.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '10px 16px', color: '#888', fontWeight: 500 }}>
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
  return <td style={{ padding: '12px 16px', borderTop: '1px solid #f3f3f3', ...style }}>{children}</td>
}
