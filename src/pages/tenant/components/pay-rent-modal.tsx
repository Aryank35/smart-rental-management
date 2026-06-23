import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import type { PaymentMethod } from '@/features/tenant/types'

interface PayRentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  period: string
  title?: string
  description?: string
  /** Settle the bills with the chosen method. Resolves on success. */
  onConfirm: (method: PaymentMethod) => Promise<unknown>
}

const methods: PaymentMethod[] = ['UPI', 'Card', 'Net Banking', 'Cash']

export function PayRentModal({
  open,
  onOpenChange,
  amount,
  period,
  title = 'Pay rent',
  description = 'Settle your outstanding balance securely.',
  onConfirm,
}: PayRentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('UPI')
  const [processing, setProcessing] = useState(false)

  async function handlePay() {
    setProcessing(true)
    try {
      await onConfirm(method)
      onOpenChange(false) // close only on success; toasts handled by the caller
    } catch {
      // Error toast is surfaced by the mutation; keep the modal open to retry.
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>

        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{period}</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold">Total payable</span>
            <span className="text-lg font-bold tabular-nums">{formatCurrency(amount)}</span>
          </div>
        </div>

        <FormField label="Payment method">
          <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {methods.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handlePay} loading={processing}>
            Pay {formatCurrency(amount)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
