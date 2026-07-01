import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, FileText, Trash2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import { PageContainer } from '@/components/layout/page-container'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { createDocument, deleteDocument, downloadAdminDocument } from '@/features/admin/api'
import { adminKeys, useAdminDocuments, useTenantOptions } from '@/features/admin/queries'
import { documentCategoryLabels, formatBytes } from '@/features/admin/utils'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { ErrorState } from './components/admin-ui'

const MAX_BYTES = 3 * 1024 * 1024 // 3 MB

/** Trigger a browser download from a data URL. */
function triggerDownload(fileName: string, dataUrl: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function AdminDocumentsPage() {
  const documents = useAdminDocuments()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const remove = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.documents() })
      toast.success('Document deleted.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const download = useMutation({
    mutationFn: (id: string) => downloadAdminDocument(id),
    onSuccess: (doc) => triggerDownload(doc.fileName, doc.dataUrl),
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <PageContainer
      title="Documents"
      description="Share agreements, receipts, and files with your tenants."
      actions={
        <Button onClick={() => setOpen(true)}>
          <Upload className="size-4" />
          Upload
        </Button>
      }
    >
      {documents.isError ? (
        <ErrorState onRetry={documents.refetch} />
      ) : documents.isLoading || !documents.data ? (
        <Skeleton className="h-[360px] rounded-lg" />
      ) : documents.data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload a file and share it with all tenants or a specific one."
          action={<Button onClick={() => setOpen(true)}>Upload document</Button>}
        />
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-2">
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Shared with</TableHead>
                    <TableHead className="hidden lg:table-cell">Size</TableHead>
                    <TableHead className="hidden lg:table-cell">Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.data.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <p className="font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{d.fileName}</p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{documentCategoryLabels[d.category]}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">
                        {d.audience === 'all' ? 'All tenants' : d.tenantName ?? 'A tenant'}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {formatBytes(d.sizeBytes)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {formatDate(d.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="Download"
                            onClick={() => download.mutate(d.id)}
                          >
                            <Download className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            aria-label="Delete"
                            onClick={() => remove.mutate(d.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>
      )}

      <UploadModal open={open} onOpenChange={setOpen} />
    </PageContainer>
  )
}

function UploadModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const tenantOptions = useTenantOptions()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('agreement')
  const [audience, setAudience] = useState<'all' | 'tenant'>('all')
  const [tenantId, setTenantId] = useState('')
  const [file, setFile] = useState<{ name: string; type: string; size: number; dataUrl: string } | null>(null)

  const reset = () => {
    setTitle('')
    setCategory('agreement')
    setAudience('all')
    setTenantId('')
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > MAX_BYTES) {
      toast.error('File is too large. Please keep it under 3 MB.')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFile({ name: f.name, type: f.type || 'application/octet-stream', size: f.size, dataUrl: reader.result as string })
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
    }
    reader.readAsDataURL(f)
  }

  const mutation = useMutation({
    mutationFn: () =>
      createDocument({
        title: title.trim(),
        category,
        fileName: file!.name,
        mimeType: file!.type,
        dataUrl: file!.dataUrl,
        sizeBytes: file!.size,
        audience,
        tenantId: audience === 'tenant' ? tenantId : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.documents() })
      toast.success('Document uploaded.')
      reset()
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const canSubmit =
    !!file && title.trim().length >= 2 && (audience === 'all' || (audience === 'tenant' && !!tenantId))

  const tenants = tenantOptions.data ?? []

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Upload document</ModalTitle>
          <ModalDescription>Files up to 3 MB. Stored securely and shared per your choice.</ModalDescription>
        </ModalHeader>
        <div className="space-y-4">
          <FormField label="File" required>
            <input
              ref={fileRef}
              type="file"
              onChange={onFile}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
            />
            {file && (
              <p className="mt-1 text-xs text-muted-foreground">
                {file.name} · {formatBytes(file.size)}
              </p>
            )}
          </FormField>

          <FormField label="Title" htmlFor="doc-title" required>
            <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rental agreement" />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentCategoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Share with">
              <Select value={audience} onValueChange={(v) => setAudience(v as 'all' | 'tenant')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tenants</SelectItem>
                  <SelectItem value="tenant">A specific tenant</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {audience === 'tenant' && (
            <FormField label="Tenant" required>
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.userId} value={t.userId}>
                      {t.name} — {t.propertyName} · {t.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!canSubmit}>
              Upload
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  )
}
