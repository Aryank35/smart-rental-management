import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** How many sibling pages to show on each side of the current page. */
  siblings?: number
  className?: string
}

/** Build the list of page tokens to render, inserting '…' for gaps. */
function buildRange(page: number, pageCount: number, siblings: number): (number | 'dots')[] {
  const totalNumbers = siblings * 2 + 5
  if (pageCount <= totalNumbers) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, pageCount)
  const showLeftDots = left > 2
  const showRightDots = right < pageCount - 1

  const range: (number | 'dots')[] = [1]
  if (showLeftDots) range.push('dots')
  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== pageCount) range.push(i)
  }
  if (showRightDots) range.push('dots')
  range.push(pageCount)
  return range
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblings = 1,
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null
  const range = buildRange(page, pageCount, siblings)

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <Button
        variant="outline"
        size="icon"
        className="size-9"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>

      {range.map((token, i) =>
        token === 'dots' ? (
          <span
            key={`dots-${i}`}
            className="flex size-9 items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <Button
            key={token}
            variant={token === page ? 'default' : 'outline'}
            size="icon"
            className="size-9"
            aria-current={token === page ? 'page' : undefined}
            onClick={() => onPageChange(token)}
          >
            {token}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="size-9"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}
