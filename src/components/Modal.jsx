import { X } from 'lucide-react'

export default function Modal({ children, onClose, title, description }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#141922] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
