import { useEffect, useMemo, useState } from 'react'
import { addDays, endOfWeek, format, isWithinInterval, startOfWeek } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import LoadingScreen from '../components/LoadingScreen'
import MemberDirectory from '../components/MemberDirectory'
import PageHeader from '../components/PageHeader'
import ProfileModal from '../components/ProfileModal'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { formatDate, parseAppDate } from '../lib/utils'

export default function Calendar() {
  const { profile, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    const run = async () => {
      if (!user?.id) {
        return
      }

      setLoading(true)

      const isAdmin = profile?.role === 'admin'
      let projectIds
      if (isAdmin) {
        const { data } = await supabase.from('projects').select('id').eq('created_by', user.id)
        projectIds = [...new Set((data ?? []).map((project) => project.id))]
      } else {
        const { data } = await supabase.from('project_members').select('project_id').eq('user_id', user.id)
        projectIds = [...new Set((data ?? []).map((item) => item.project_id))]
      }

      let taskRows = []
      if (projectIds.length > 0) {
        const { data } = await supabase
          .from('tasks')
          .select('id, title, assigned_to, due_date, status, description, project_id')
          .in('project_id', projectIds)
        taskRows = data ?? []
      }

      const memberIds = [...new Set(taskRows.map((task) => task.assigned_to).filter(Boolean))]
      const { data: userRows } = memberIds.length
        ? await supabase.from('users').select('id, email, full_name, role').in('id', memberIds)
        : { data: [] }

      setTasks(taskRows)
      setMembers(userRows ?? [])
      setLoading(false)
    }

    run()
  }, [profile?.role, user?.id])

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index)
        return {
          date,
          key: format(date, 'yyyy-MM-dd'),
          label: format(date, 'EEE'),
          num: format(date, 'd'),
        }
      }),
    [weekStart],
  )

  const tasksByDay = useMemo(() => {
    return weekDays.reduce((accumulator, day) => {
      accumulator[day.key] = tasks.filter(
        (task) => task.due_date && format(parseAppDate(task.due_date), 'yyyy-MM-dd') === day.key,
      )
      return accumulator
    }, {})
  }, [tasks, weekDays])

  const weekTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.due_date) {
        return false
      }

      const dueDate = parseAppDate(task.due_date)
      return isWithinInterval(dueDate, { end: weekEnd, start: weekStart })
    })
  }, [tasks, weekEnd, weekStart])

  const unscheduledTasks = useMemo(() => tasks.filter((task) => !task.due_date).slice(0, 6), [tasks])

  if (loading) {
    return <LoadingScreen label="Loading calendar" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendar"
        title="Weekly planning board"
        description="A structured week view for due tasks and member workload."
      />

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Week view</h3>
              <p className="mt-1 text-sm text-slate-500">
                {format(weekStart, 'dd MMM yyyy')} to {format(weekEnd, 'dd MMM yyyy')}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>

          {weekTasks.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={CalendarDays}
                title="No dated tasks this week"
                description="Tasks will appear here automatically when they have a real due date inside the current week."
              />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-7 gap-3">
                  {weekDays.map((day) => (
                    <div key={day.key} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center shadow-sm">
                      <p className="text-sm font-bold text-slate-900">{day.num}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{day.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-7 gap-3">
                  {weekDays.map((day) => (
                    <div
                      key={day.key}
                      className="min-h-[320px] rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                    >
                      <div className="space-y-3">
                        {(tasksByDay[day.key] ?? []).length === 0 ? (
                          <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-center text-xs font-medium text-slate-400">
                            No tasks
                          </div>
                        ) : (
                          (tasksByDay[day.key] ?? []).map((task) => (
                            <div
                              key={task.id}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:shadow-md"
                            >
                              <p className="truncate text-sm font-bold text-slate-900">{task.title}</p>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {members.find((member) => member.id === task.assigned_to)?.full_name ||
                                  members.find((member) => member.id === task.assigned_to)?.email ||
                                  'Unassigned'}
                              </p>
                              {task.description ? (
                                <p className="mt-2 line-clamp-2 text-xs text-slate-400">{task.description}</p>
                              ) : null}
                              <div className="mt-3">
                                <StatusBadge status={task.status} />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {unscheduledTasks.length > 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unscheduled tasks</h4>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {unscheduledTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.description || 'No description provided.'}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <MemberDirectory members={members} onSelectMember={setSelectedMember} title="Available members" compact />

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Upcoming due dates</h3>
            <p className="mt-1 text-sm text-slate-500">Real task dates from Supabase only.</p>
            <div className="mt-5 space-y-3">
              {tasks.filter((task) => task.due_date).slice(0, 6).length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500 text-center">
                  No tasks with due dates yet.
                </p>
              ) : (
                tasks
                  .filter((task) => task.due_date)
                  .sort((a, b) => parseAppDate(a.due_date) - parseAppDate(b.due_date))
                  .slice(0, 6)
                  .map((task) => (
                    <div key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(task.due_date)}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedMember ? <ProfileModal key={selectedMember.id} onClose={() => setSelectedMember(null)} userProfile={selectedMember} /> : null}
    </div>
  )
}
