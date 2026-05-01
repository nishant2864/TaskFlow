import { getStatusMeta } from '../lib/utils'

export default function StatusBadge({ status }) {
  const meta = getStatusMeta(status)

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
      {meta.label}
    </span>
  )
}
