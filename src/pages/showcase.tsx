import { useState } from 'react'
import {
  Building2,
  CreditCard,
  Download,
  Home,
  Mail,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { ThemeSelect } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

const sampleRows = [
  { id: 'TXN-1042', tenant: 'Aarav Sharma', amount: 18500, status: 'Paid' },
  { id: 'TXN-1043', tenant: 'Priya Nair', amount: 22000, status: 'Pending' },
  { id: 'TXN-1044', tenant: 'Rohan Gupta', amount: 15750, status: 'Overdue' },
]

export function ShowcasePage() {
  const { toast } = useToast()
  const [page, setPage] = useState(3)

  return (
    <PageContainer
      title="TenantFlow Design System"
      description="Phase 1 foundation — every reusable component, light & dark ready."
      actions={<ThemeSelect />}
    >
      <div className="space-y-12">
        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Pay Rent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">
              <Trash2 /> Delete
            </Button>
            <Button variant="link">Link</Button>
            <Button loading>Processing</Button>
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
          </div>
        </Section>

        {/* Form controls */}
        <Section title="Inputs & Select">
          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input id="email" type="email" placeholder="you@example.com" leadingIcon={<Mail />} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="search">Search</Label>
              <Input id="search" placeholder="Search tenants…" leadingIcon={<Search />} />
            </div>
            <div className="space-y-1.5">
              <Label>Property</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greenwood">Greenwood Residency</SelectItem>
                  <SelectItem value="lakeview">Lakeview Apartments</SelectItem>
                  <SelectItem value="sunrise">Sunrise Towers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="err">With error</Label>
              <Input id="err" error placeholder="Invalid value" defaultValue="123" />
            </div>
          </div>
        </Section>

        {/* Cards & summary stats */}
        <Section title="Cards & Stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Current Rent', value: 18500, icon: Home, hint: 'Due 5 Jul' },
              { label: 'Electricity Bill', value: 1240, icon: CreditCard, hint: '142 units' },
              { label: 'Outstanding Dues', value: 3750, icon: TriangleAlert, hint: 'Overdue' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">
                      {formatCurrency(stat.value)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <stat.icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Rent Agreement</CardTitle>
              <CardDescription>Greenwood Residency · Room 204</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Your agreement is active until 31 Mar 2027.
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">
                <Download /> Download
              </Button>
              <Button size="sm" variant="outline">
                View
              </Button>
            </CardFooter>
          </Card>
        </Section>

        {/* Badges & avatars */}
        <Section title="Badges & Avatars">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success" dot>
              Paid
            </Badge>
            <Badge variant="warning" dot>
              Pending
            </Badge>
            <Badge variant="destructive" dot>
              Overdue
            </Badge>
            <Badge variant="info">Notice</Badge>
            <div className="ml-4 flex -space-x-2">
              {['Aarav Sharma', 'Priya Nair', 'Rohan Gupta'].map((n) => (
                <Avatar key={n} className="ring-2 ring-background">
                  <AvatarFallback>{n.split(' ').map((p) => p[0]).join('')}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </Section>

        {/* Alerts */}
        <Section title="Alerts">
          <div className="grid gap-3 lg:grid-cols-2">
            <Alert variant="info">
              <AlertTitle>Rent reminder</AlertTitle>
              <AlertDescription>Your rent of ₹18,500 is due on 5 Jul.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <AlertTitle>Payment received</AlertTitle>
              <AlertDescription>We've recorded your payment. Receipt is ready.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Agreement expiring</AlertTitle>
              <AlertDescription>Your lease ends in 30 days. Renew to continue.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Overdue payment</AlertTitle>
              <AlertDescription>A penalty applies after 3 days past due.</AlertDescription>
            </Alert>
          </div>
        </Section>

        {/* Toasts, Modal, Drawer */}
        <Section title="Overlays & Feedback">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => toast.success('Rent paid successfully!')}>
              Success toast
            </Button>
            <Button variant="outline" onClick={() => toast.error('Payment failed. Try again.')}>
              Error toast
            </Button>

            <Modal>
              <ModalTrigger asChild>
                <Button variant="outline">Open modal</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Confirm payment</ModalTitle>
                  <ModalDescription>
                    You're about to pay {formatCurrency(18500)} towards July rent.
                  </ModalDescription>
                </ModalHeader>
                <ModalFooter>
                  <ModalClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </ModalClose>
                  <ModalClose asChild>
                    <Button>Pay now</Button>
                  </ModalClose>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Open drawer</Button>
              </DrawerTrigger>
              <DrawerContent side="right">
                <DrawerHeader>
                  <DrawerTitle>Filters</DrawerTitle>
                  <DrawerDescription>Refine the tenant list.</DrawerDescription>
                </DrawerHeader>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button>Apply</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </Section>

        {/* Tabs + Table + Pagination */}
        <Section title="Tabs, Table & Pagination">
          <Tabs defaultValue="payments">
            <TabsList>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="empty">Empty</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
            </TabsList>
            <TabsContent value="payments">
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.id}</TableCell>
                        <TableCell>{row.tenant}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(row.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.status === 'Paid'
                                ? 'success'
                                : row.status === 'Pending'
                                  ? 'warning'
                                  : 'destructive'
                            }
                            dot
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
              <Pagination
                className="mt-4"
                page={page}
                pageCount={10}
                onPageChange={setPage}
              />
            </TabsContent>
            <TabsContent value="empty">
              <EmptyState
                icon={Building2}
                title="No properties yet"
                description="Add your first property to start managing rooms and tenants."
                action={
                  <Button>
                    <Plus /> Add property
                  </Button>
                }
              />
            </TabsContent>
            <TabsContent value="loading">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </PageContainer>
  )
}
