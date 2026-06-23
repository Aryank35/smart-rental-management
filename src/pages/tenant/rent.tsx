import { useState } from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  useRentDetails,
  useRentHistory,
  useTenantDashboard,
  usePayBills,
} from '@/features/tenant/queries'
import { RentSummary, RentSummarySkeleton } from './components/rent-summary'
import {
  PaymentHistoryTable,
  PaymentHistoryTableSkeleton,
} from './components/payment-history-table'
import { PayRentModal } from './components/pay-rent-modal'

export function RentPage() {
  const rent = useRentDetails()
  const history = useRentHistory()
  const dashboard = useTenantDashboard()
  const payMutation = usePayBills()
  const [payOpen, setPayOpen] = useState(false)

  const isError = rent.isError || history.isError

  const receiptContext = {
    tenantName: dashboard.data?.tenancy.tenantName ?? 'Tenant',
    propertyName: dashboard.data?.tenancy.propertyName ?? '—',
    roomNumber: dashboard.data?.tenancy.roomNumber ?? '—',
  }

  return (
    <PageContainer
      title="Rent"
      description="Your rent, deposit, penalties, and full payment history."
    >
      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load rent details</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            Please try again in a moment.
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                rent.refetch()
                history.refetch()
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {rent.isLoading || !rent.data ? (
            <RentSummarySkeleton />
          ) : (
            <RentSummary rent={rent.data} onPay={() => setPayOpen(true)} />
          )}

          {history.isLoading || !history.data ? (
            <PaymentHistoryTableSkeleton />
          ) : (
            <PaymentHistoryTable payments={history.data} receiptContext={receiptContext} />
          )}
        </div>
      )}

      {rent.data && (
        <PayRentModal
          open={payOpen}
          onOpenChange={setPayOpen}
          amount={rent.data.outstandingBalance}
          period="Outstanding balance"
          onConfirm={(method) => payMutation.mutateAsync({ scope: 'rent', method })}
        />
      )}
    </PageContainer>
  )
}
