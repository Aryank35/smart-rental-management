import { formatCurrency, formatDate } from '@/lib/utils'
import type { RentPayment } from './types'

interface ReceiptContext {
  tenantName: string
  propertyName: string
  roomNumber: string
}

/**
 * Generate a printable HTML rent receipt and trigger a browser download.
 * (Mock: produced client-side. A real backend would return a signed PDF.)
 */
export function downloadRentReceipt(payment: RentPayment, ctx: ReceiptContext) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Receipt ${payment.receiptNo}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; max-width: 640px; margin: 40px auto; padding: 0 24px; }
  .brand { color: #4f46e5; font-size: 22px; font-weight: 800; }
  .muted { color: #64748b; }
  h1 { font-size: 18px; margin: 24px 0 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
  td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  .total td { border-top: 2px solid #1e293b; border-bottom: none; font-weight: 700; font-size: 16px; }
  .badge { display:inline-block; padding:2px 10px; border-radius:9999px; background:#dcfce7; color:#16a34a; font-size:12px; font-weight:600; }
  footer { margin-top: 40px; font-size: 12px; }
</style>
</head>
<body>
  <div class="brand">TenantFlow</div>
  <p class="muted">Rent Payment Receipt</p>
  <h1>Receipt ${payment.receiptNo}</h1>
  <p class="muted">${payment.paidOn ? `Paid on ${formatDate(payment.paidOn)}` : `Due ${formatDate(payment.dueDate)}`}</p>
  <table>
    <tr><td>Tenant</td><td>${ctx.tenantName}</td></tr>
    <tr><td>Property</td><td>${ctx.propertyName} · Room ${ctx.roomNumber}</td></tr>
    <tr><td>Billing period</td><td>${payment.period}</td></tr>
    <tr><td>Payment method</td><td>${payment.method ?? '—'}</td></tr>
    <tr><td>Status</td><td><span class="badge">${payment.status.toUpperCase()}</span></td></tr>
    <tr class="total"><td>Amount paid</td><td>${formatCurrency(payment.amount)}</td></tr>
  </table>
  <footer class="muted">This is a system-generated receipt and does not require a signature.</footer>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${payment.receiptNo}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
