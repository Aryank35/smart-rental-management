import { z } from 'zod'

export const complaintSchema = z.object({
  title: z.string().trim().min(4, 'Enter a short issue title').max(80),
  category: z.enum(['maintenance', 'plumbing', 'electrical', 'cleaning', 'security', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  location: z.string().trim().min(2, 'Enter where the issue is located').max(80),
  description: z.string().trim().min(10, 'Describe the issue in at least 10 characters').max(1000),
})

export type ComplaintInput = z.infer<typeof complaintSchema>
