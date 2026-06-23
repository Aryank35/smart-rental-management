import { PageContainer } from '@/components/layout/page-container'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useTenantDashboard } from '@/features/tenant/queries'
import { WelcomeCard, WelcomeCardSkeleton } from './components/welcome-card'
import { QuickActions } from './components/quick-actions'
import { SummaryCards, SummaryCardsSkeleton } from './components/summary-cards'
import { UpcomingPayments } from './components/upcoming-payments'
import { RecentNotices } from './components/recent-notices'
import { RecentPayments } from './components/recent-payments'
import { WidgetSkeleton } from './components/widget-card'

export function TenantDashboardPage() {
  const { data, isLoading, isError, refetch } = useTenantDashboard()

  return (
    <PageContainer title="Dashboard">
      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load your dashboard</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            Something went wrong while fetching your data.
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : isLoading || !data ? (
        <div className="space-y-6">
          <WelcomeCardSkeleton />
          <SummaryCardsSkeleton />
          <div className="grid gap-5 lg:grid-cols-3">
            <WidgetSkeleton />
            <WidgetSkeleton />
            <WidgetSkeleton />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <WelcomeCard tenancy={data.tenancy} />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Quick actions</h2>
            <QuickActions />
          </section>

          <SummaryCards summary={data.summary} />

          <div className="grid items-start gap-5 lg:grid-cols-3">
            <UpcomingPayments payments={data.upcomingPayments} />
            <RecentNotices notices={data.recentNotices} />
            <RecentPayments payments={data.recentPayments} />
          </div>
        </div>
      )}
    </PageContainer>
  )
}
