import { useMutation } from '@tanstack/react-query'
import { Download, FileText } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageContainer } from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { downloadDocument } from '@/features/tenant/api'
import { useDocuments } from '@/features/tenant/queries'
import { documentCategoryLabels, formatBytes } from '@/features/admin/utils'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'

function triggerDownload(fileName: string, dataUrl: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function TenantDocumentsPage() {
  const documents = useDocuments()

  const download = useMutation({
    mutationFn: (id: string) => downloadDocument(id),
    onSuccess: (doc) => triggerDownload(doc.fileName, doc.dataUrl),
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <PageContainer title="Documents" description="Files shared with you by your property manager.">
      {documents.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load documents</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            Please try again in a moment.
            <Button size="sm" variant="outline" onClick={() => documents.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : documents.isLoading || !documents.data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>
      ) : documents.data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Agreements and files shared with you will appear here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.data.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </span>
                  <Badge variant="secondary">{documentCategoryLabels[d.category]}</Badge>
                </div>
                <h3 className="mt-3 truncate font-semibold">{d.title}</h3>
                <p className="truncate text-xs text-muted-foreground">{d.fileName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatBytes(d.sizeBytes)} · {formatDate(d.createdAt)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  loading={download.isPending && download.variables === d.id}
                  onClick={() => download.mutate(d.id)}
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
