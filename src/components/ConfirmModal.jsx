import { LoaderCircle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmModal({
  confirmLabel = 'Confirm',
  description,
  loading = false,
  onClose,
  onConfirm,
  title,
  tone = 'danger',
}) {
  const buttonClass =
    tone === 'danger'
      ? 'border border-rose-500/25 bg-rose-500/15 text-rose-200 hover:bg-rose-500/20'
      : 'bg-[#4e80ff] text-white hover:bg-[#5a89ff]'

  return (
    <Modal title={title} description={description} onClose={onClose}>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass}`}
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
