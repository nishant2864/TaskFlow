/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const toastStyles = {
  error: {
    icon: AlertCircle,
    iconClass: 'text-rose-300',
    shellClass: 'border-rose-500/25 bg-[#151b24] text-white',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-300',
    shellClass: 'border-blue-500/25 bg-[#151b24] text-white',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-300',
    shellClass: 'border-emerald-500/25 bg-[#151b24] text-white',
  },
}

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    ({ title, description, type = 'info' }) => {
      const fingerprint = `${type}:${title}:${description ?? ''}`
      const id = crypto.randomUUID()

      setToasts((current) => {
        const alreadyVisible = current.some(
          (toast) =>
            `${toast.type}:${toast.title}:${toast.description ?? ''}` === fingerprint,
        )

        if (alreadyVisible) {
          return current
        }

        return [...current, { description, id, title, type }]
      })

      window.setTimeout(() => {
        dismissToast(id)
      }, 3500)
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({
      dismissToast,
      toast: pushToast,
    }),
    [dismissToast, pushToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const config = toastStyles[toast.type] ?? toastStyles.info
          const Icon = config.icon

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl border p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur ${config.shellClass}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg border border-white/10 bg-white/[0.04] p-2 shadow-sm">
                  <Icon className={`h-4 w-4 ${config.iconClass}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm text-slate-400">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-lg p-1 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
