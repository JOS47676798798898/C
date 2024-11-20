import { toast as sonnerToast, ToastT } from 'sonner'

export function toast({ 
  title, 
  description, 
  variant = "default" 
}: {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}): void {
  sonnerToast(title ?? '', {
    description: description,
    style: {
      backgroundColor: variant === "destructive" ? "#ef4444" : "#22c55e"
    }
  })
} 