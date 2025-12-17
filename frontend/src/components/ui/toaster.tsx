import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const icons = {
  default: Info,
  success: CheckCircle,
  destructive: AlertCircle,
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = icons[toast.variant || "default"]
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg animate-slide-in",
              toast.variant === "destructive" && "border-destructive/50 bg-destructive/10",
              toast.variant === "success" && "border-green-500/50 bg-green-500/10"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 mt-0.5",
                toast.variant === "destructive" && "text-destructive",
                toast.variant === "success" && "text-green-500",
                !toast.variant && "text-muted-foreground"
              )}
            />
            <div className="flex-1">
              {toast.title && (
                <p className="font-medium text-sm">{toast.title}</p>
              )}
              {toast.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
