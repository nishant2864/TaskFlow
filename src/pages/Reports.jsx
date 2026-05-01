import { useEffect, useMemo, useState } from 'react'
import { eachMonthOfInterval, endOfYear, format, startOfYear } from 'date-fns'
import { BarChart3, BriefcaseBusiness, Clock3, Users } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import LoadingScreen from '../components/LoadingScreen'
import MemberDirectory from '../components/MemberDirectory'
import PageHeader from '../components/PageHeader'
import ProfileModal from '../components/ProfileModal'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { parseAppDate } from '../lib/utils'

function ProgressBar({ label, value, colorClass }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/[0.05]">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function Reports() {
  const { profile, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
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
      let projectRows = []

      if (isAdmin) {
        const { data } = await supabase.from('projects').select('*').eq('created_by', user.id)
        projectRows = data ?? []
      } else {
        const { data } = await supabase.from('project_members').select('project_id').eq('user_id', user.id)
        const projectIds = [...new Set((data ?? []).map((item) => item.project_id))]
        if (projectIds.length > 0) {
          const { data: projectsData } = await supabase.from('projects').select('*').in('id', projectIds)
          projectRows = projectsData ?? []
        }
      }

      const projectIds = projectRows.map((project) => project.id)
      const { data: taskRows } = projectIds.length
        ? await supabase
            .from('tasks')
            .select('id, status, assigned_to, project_id, due_date')
            .in('project_id', projectIds)
        : { data: [] }

      const memberIds = [...new Set((taskRows ?? []).map((task) => task.assigned_to).filter(Boolean))]
      const { data: userRows } = memberIds.length
        ? await supabase.from('users').select('id, email, full_name, role').in('id', memberIds)
        : { data: [] }

      setProjects(projectRows)
      setTasks(taskRows ?? [])
      setMembers(userRows ?? [])
      setLoading(false)
    }

    run()
  }, [profile?.role, user?.id])

  const stats = useMemo(() => {
    const finishedProjects = projects.filter((project) => project.is_finished).length
    const completedTasks = tasks.filter((task) => task.status === 'done').length
    const workHours = tasks.length * 3
    const completion = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
    const finishedRate = projects.length ? Math.round((finishedProjects / projects.length) * 100) : 0
    const activeRate = Math.max(0, 100 - finishedRate)

    return {
      activeRate,
      completion,
      finishedProjects,
      totalMembers: members.length,
      totalProjects: projects.length,
      totalWorkHours: workHours,
    }
  }, [members.length, projects, tasks])

  const monthlyCapacity = useMemo(() => {
    const months = eachMonthOfInterval({
      end: endOfYear(new Date()),
      start: startOfYear(new Date()),
    })

    return months.map((monthDate) => {
      const count = tasks.filter((task) => {
        if (!task.due_date) {
          return false
        }

        const dueDate = parseAppDate(task.due_date)
        return (
          dueDate.getFullYear() === monthDate.getFullYear() &&
          dueDate.getMonth() === monthDate.getMonth()
        )
      }).length

      return {
        count,
        label: format(monthDate, 'MMM'),
      }
    })
  }, [tasks])

  const maxMonthlyCount = useMemo(
    () => Math.max(...monthlyCapacity.map((item) => item.count), 0),
    [monthlyCapacity],
  )

  if (loading) {
    return <LoadingScreen label="Loading reports..." />
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reporting"
        title="Delivery reports"
        description="A concise operational view of throughput, completion, and capacity based on the live project and task data in this workspace."
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="saas-card p-6 lg:p-8">
          <p className="section-kicker mb-3">Summary</p>
          <h3 className="text-xl font-semibold tracking-tight text-white">Read the portfolio without overexplaining it.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            These numbers are intentionally plain: enough to show momentum, enough to surface risk, and quiet enough that the team can trust what they are seeing.
          </p>
        </div>

        <div className="saas-card p-6">
          <p className="section-kicker mb-3">Period</p>
          <p className="text-3xl font-semibold tracking-tight text-white">{format(new Date(), 'yyyy')}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">Monthly capacity is calculated from real due dates already recorded on tasks this year.</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard accent="text-blue-300" hint="Projects currently visible in this reporting scope." icon={BriefcaseBusiness} label="Projects" value={stats.totalProjects} />
        <StatCard accent="text-emerald-300" hint="People directly represented by assigned task data." icon={Users} label="Team members" value={stats.totalMembers} />
        <StatCard accent="text-amber-300" hint="A simple proxy based on task volume, at three hours per item." icon={Clock3} label="Estimated hours" value={`${stats.totalWorkHours}h`} />
        <StatCard accent="text-violet-300" hint="Share of tracked tasks already marked done." icon={BarChart3} label="Completion" value={`${stats.completion}%`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="saas-card p-6">
          <p className="section-kicker mb-3">Health</p>
          <h3 className="text-lg font-semibold tracking-tight text-white">Portfolio progress</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">A compact read on finished work, active portfolio share, and task completion.</p>
          <div className="mt-6 space-y-5">
            <ProgressBar label="Completed tasks" value={stats.completion} colorClass="bg-emerald-400" />
            <ProgressBar
              label="Finished projects"
              value={projects.length ? Math.round((stats.finishedProjects / projects.length) * 100) : 0}
              colorClass="bg-violet-400"
            />
            <ProgressBar label="Active portfolio" value={stats.activeRate} colorClass="bg-blue-400" />
          </div>
        </div>

        <div className="saas-card p-6">
          <p className="section-kicker mb-3">Capacity</p>
          <h3 className="text-lg font-semibold tracking-tight text-white">Monthly task volume</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Counts are grouped by due date month so you can spot packed periods and empty ones quickly.</p>
          {tasks.filter((task) => task.due_date).length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={BarChart3}
                title="No dated task data"
                description="Reports will start filling in once tasks with due dates are added."
              />
            </div>
          ) : (
            <div className="mt-6 flex h-56 items-end gap-4">
              {monthlyCapacity.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-3xl bg-[linear-gradient(180deg,#7aa2ff_0%,#3558c8_100%)]"
                    style={{
                      height: `${Math.max(24, maxMonthlyCount ? (item.count / maxMonthlyCount) * 180 : 24)}px`,
                    }}
                  />
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="text-[11px] font-medium text-slate-500">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <MemberDirectory members={members} onSelectMember={setSelectedMember} title="People represented in reports" />

      {selectedMember ? (
        <ProfileModal key={selectedMember.id} onClose={() => setSelectedMember(null)} userProfile={selectedMember} />
      ) : null}
    </div>
  )
}
