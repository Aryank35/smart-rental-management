import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

interface PlaceholderPageProps {
  title: string
  phase?: string
}

/** Temporary page for routes whose feature module isn't built yet. */
export function PlaceholderPage({ title, phase }: PlaceholderPageProps) {
  return (
    <PageContainer title={title}>
      <EmptyState
        icon={Construction}
        title="Coming soon"
        description={
          phase
            ? `This screen is part of ${phase} and will be built next.`
            : 'This screen will be built in an upcoming phase.'
        }
        action={
          <Button variant="outline" asChild>
            <Link to="/components">View design system</Link>
          </Button>
        }
      />
    </PageContainer>
  )
}
