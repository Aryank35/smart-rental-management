import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  Building2,
  IndianRupee,
  MessageSquareWarning,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table'
import { useAdminDashboard } from '@/features/admin/queries'
import { billTypeLabels } from '@/features/admin/utils'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ErrorState, StatCard } from './components/admin-ui'

export function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminDashboard()

  return (
    <PageContainer
      title="Dashboard"
      description={data?.org ? `${data.org.name} — portfolio overview` : 'Portfolio overview'}
    >
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Collected this month"
              value={formatCurrency(data.stats.collectedThisMonth)}
              hint="Payments received"
              icon={IndianRupee}
              iconClassName="bg-success/10 text-success"
            />
            <StatCard
              label="Outstanding dues"
              value={formatCurrency(data.stats.totalOutstanding)}
              hint={`${formatCurrency(data.stats.overdueAmount)} overdue`}
              icon={Wallet}
              iconClassName="bg-warning/10 text-warning"
              emphasize={data.stats.overdueAmount > 0}
            />
            <StatCard
              label="Occupancy"
              value={`${data.stats.occupancyRate}%`}
              hint={`${data.stats.occupied}/${data.stats.units} units occupied`}
              icon={TrendingUp}
              iconClassName="bg-info/10 text-info"
            />
            <StatCard
              label="Open complaints"
              value={data.stats.openComplaints}
              hint="Awaiting action"
              icon={MessageSquareWarning}
              iconClassName="bg-destructive/10 text-destructive"
              emphasize={data.stats.openComplaints > 0}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Properties" value={data.stats.properties} icon={Building2} />
            <StatCard label="Active tenants" value={data.stats.tenants} icon={Users} />
            <StatCard
              label="Vacant units"
              value={data.stats.vacant}
              hint={`${data.stats.maintenance} in maintenance`}
              icon={AlertTriangle}
              iconClassName="bg-secondary text-secondary-foreground"
            />
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Collections — last 6 months</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={64}
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(v) => `₹${Math.round(Number(v) / 1000)}k`}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v) => [formatCurrency(Number(v)), 'Collected']}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Recent payments</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentPayments.length === 0 ? (
                  <EmptyState
                    icon={IndianRupee}
                    title="No payments yet"
                    description="Payments will appear here as tenants pay."
                    className="py-8"
                  />
                ) : (
                  <TableWrapper>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tenant</TableHead>
                          <TableHead>For</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.recentPayments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <p className="font-medium">{p.tenantName}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(p.paidOn)}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{billTypeLabels[p.type]}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(p.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableWrapper>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-muted-foreground">
                Manage your portfolio from the sidebar — add properties, onboard tenants, and
                generate bills.
              </p>
              <div className="flex gap-2">
                <Link
                  to="/admin/properties"
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Properties
                </Link>
                <Link
                  to="/admin/tenants"
                  className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
                >
                  Tenants
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px] rounded-lg" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px] rounded-lg" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <Skeleton className="h-[340px] rounded-lg lg:col-span-3" />
        <Skeleton className="h-[340px] rounded-lg lg:col-span-2" />
      </div>
    </div>
  )
}
