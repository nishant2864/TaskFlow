import { clsx } from 'clsx'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) {
    return 'No due date'
  }

  return format(parseAppDate(date), 'dd MMM yyyy')
}

export function parseAppDate(date) {
  return parseISO(date)
}

export function isTaskOverdue(task) {
  if (!task?.due_date || task?.status === 'done') {
    return false
  }

  const dueDate = parseAppDate(task.due_date)
  return isPast(dueDate) && !isToday(dueDate)
}

export function getStatusMeta(status) {
  switch (status) {
    case 'done':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        label: 'Done',
      }
    case 'in-progress':
      return {
        badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        label: 'In Progress',
      }
    case 'todo':
    default:
      return {
        badge: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
        label: 'To Do',
      }
  }
}

export function getProjectStateMeta(project) {
  if (project?.is_finished) {
    return {
      badge: 'bg-white/5 text-slate-400 border border-white/10',
      label: 'Finished',
    }
  }

  return {
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    label: 'Active',
  }
}

export async function withTimeout(promise, ms = 10000, message = 'Request timed out.') {
  let timeoutId

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(message))
    }, ms)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    window.clearTimeout(timeoutId)
  }
}
