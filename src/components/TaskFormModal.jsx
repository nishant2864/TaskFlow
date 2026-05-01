import { LoaderCircle } from 'lucide-react'
import Modal from './Modal'

export default function TaskFormModal({
  form,
  members,
  mode = 'create',
  onChange,
  onClose,
  onSubmit,
  projects = [],
  showProjectField = false,
  submitting,
}) {
  const isEdit = mode === 'edit'

  return (
    <Modal
      title={isEdit ? 'Edit task' : 'Create task'}
      description={
        isEdit
          ? 'Adjust ownership, due date, and progress without losing the task history.'
          : 'Capture the work clearly so the assignee can move without extra back-and-forth.'
      }
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {showProjectField ? (
          <label className="block">
            <span className="field-label">Project</span>
            <select
              required
              value={form.project_id}
              onChange={(event) => onChange('project_id', event.target.value)}
              className="input-field mt-2"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="field-label">Title</span>
          <input
            type="text"
            required
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            className="input-field mt-2"
            placeholder="Review API error handling"
          />
        </label>

        <label className="block">
          <span className="field-label">Details</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => onChange('description', event.target.value)}
            className="input-field mt-2"
            placeholder="Add the context, expected outcome, and any dependencies."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Assign to</span>
            <select
              value={form.assigned_to}
              onChange={(event) => onChange('assigned_to', event.target.value)}
              className="input-field mt-2"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.email}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="field-label">Status</span>
            <select
              value={form.status}
              onChange={(event) => onChange('status', event.target.value)}
              className="input-field mt-2"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="field-label">Due date</span>
          <input
            type="date"
            value={form.due_date}
            onChange={(event) => onChange('due_date', event.target.value)}
            className="input-field mt-2"
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
            {isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
