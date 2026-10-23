'use client'
import { colors } from '@/lib/theme'

export default function Modal({
  open,
  onClose,
  width = 480,
  children,
}: {
  open: boolean
  onClose: () => void
  width?: number
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: colors.layout.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 30,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'auto',
          background: colors.layout.surface,
          borderRadius: 14,
          padding: 26,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  )
}
