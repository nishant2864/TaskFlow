import { LoaderCircle } from 'lucide-react'
import Modal from './Modal'

export default function ProjectFormModal({
  form,
  mode = 'create',
  onChange,
  onClose,
  onSubmit,
  submitting,
}) {
  const isEdit = mode === 'edit'

  return (
    <Modal
      title={isEdit ? 'Edit project' : 'Create project'}
      description={
        isEdit
          ? 'Keep the name and summary clear so everyone understands the scope.'
          : 'Set a concise name and a short brief the team can scan quickly.'
      }
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="field-label">Title</span>
          <input
            type="text"
            required
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            className="input-field mt-2"
            placeholder="Q3 migration rollout"
          />
        </label>

        <label className="block">
          <span className="field-label">Summary</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => onChange('description', event.target.value)}
            className="input-field mt-2"
            placeholder="Scope, owners, and the outcome this project is meant to deliver."
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isEdit ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
