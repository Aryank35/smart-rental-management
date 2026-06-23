import { create } from 'zustand'

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info'

export interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastState {
  toasts: ToastItem[]
  add: (toast: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
}

let counter = 0
function nextId() {
  counter += 1
  return `toast-${counter}`
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = nextId()
    set((s) => ({ toasts: [...s.toasts, { id, duration: 5000, ...toast }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/**
 * Imperative toast helper usable outside React (e.g. in query callbacks).
 * In components prefer the `useToast` hook below.
 */
export const toast = {
  show: (t: Omit<ToastItem, 'id'>) => useToastStore.getState().add(t),
  success: (description: string, title?: string) =>
    useToastStore.getState().add({ description, title, variant: 'success' }),
  error: (description: string, title?: string) =>
    useToastStore.getState().add({ description, title, variant: 'destructive' }),
  warning: (description: string, title?: string) =>
    useToastStore.getState().add({ description, title, variant: 'warning' }),
  info: (description: string, title?: string) =>
    useToastStore.getState().add({ description, title, variant: 'info' }),
}

export function useToast() {
  const add = useToastStore((s) => s.add)
  const dismiss = useToastStore((s) => s.dismiss)
  return { toast, add, dismiss }
}
