import { useNavigate } from 'react-router-dom'
import { Download, MessageSquareWarning, Receipt, Wallet, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

interface QuickAction {
  label: string
  icon: LucideIcon
  onClick: () => void
  className: string
}

export function QuickActions() {
  const navigate = useNavigate()

  const actions: QuickAction[] = [
    {
      label: 'Pay Rent',
      icon: Wallet,
      onClick: () => navigate('/app/rent'),
      className: 'bg-primary/10 text-primary',
    },
    {
      label: 'Raise Complaint',
      icon: MessageSquareWarning,
      onClick: () => navigate('/app/complaints'),
      className: 'bg-info/10 text-info',
    },
    {
      label: 'Download Agreement',
      icon: Download,
      onClick: () => toast.info('Preparing your agreement download…'),
      className: 'bg-success/10 text-success',
    },
    {
      label: 'View Bills',
      icon: Receipt,
      onClick: () => navigate('/app/bills'),
      className: 'bg-warning/10 text-warning',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <Card
          key={action.label}
          role="button"
          tabIndex={0}
          onClick={action.onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              action.onClick()
            }
          }}
          className="flex cursor-pointer flex-col items-center gap-2 p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className={`flex size-11 items-center justify-center rounded-full ${action.className}`}>
            <action.icon className="size-5" />
          </span>
          <span className="text-xs font-medium leading-tight sm:text-sm">{action.label}</span>
        </Card>
      ))}
    </div>
  )
}
