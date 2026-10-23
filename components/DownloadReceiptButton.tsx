'use client'
import Button from '@/components/Button'

export default function DownloadReceiptButton({
  orderId,
  title,
  amount,
  customer,
  createdAt,
}: {
  orderId: number
  title: string
  amount: string
  customer: string
  createdAt: string
}) {
  function download() {
    const text = `TryEntitle\nReceipt for order #${orderId}\n\n${title}\nAmount: ${amount}\nCustomer: ${customer}\nDate: ${createdAt}\n`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `order-${orderId}-receipt.txt`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <Button variant="outline" onClick={download}>
      Download receipt
    </Button>
  )
}
