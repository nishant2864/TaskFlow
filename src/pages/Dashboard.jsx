import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  MessageSquareMore,
  Search,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'
import MemberDirectory from '../components/MemberDirectory'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { formatDate, getProjectStateMeta } from '../lib/utils'

export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [search, setSearch] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('has_seen_onboarding')) {
      navigate('/onboarding')
      return
    }

    const run = async () => {
      if (!user?.id || !profile) {
        return
      }

      setLoading(true)
      setErrorMessage('')

      try {
        let memberRows = []

        if (profile.role === 'admin') {
          const { data: workspaceMembers, error: membersError } = await supabase
            .from('users')
            .select('id, email, full_name, role')

          if (membersError) {
            throw new Error(`Members failed: ${membersError.message}`)
          }

          memberRows = workspaceMembers ?? []
        } else {
          const { data: myMemberships, error: membershipError } = await supabase
            .from('project_members')
            .select('project_id')
            .eq('user_id', user.id)

          if (membershipError) {
            throw new Error(`Memberships failed: ${membershipError.message}`)
          }

          const myProjectIds = [...new Set((myMemberships ?? []).map((item) => item.project_id))]

          if (myProjectIds.length > 0) {
            const { data: sharedMemberships, error: sharedError } = await supabase
              .from('project_members')
              .select('user_id')
              .in('project_id', myProjectIds)

            if (sharedError) {
              throw new Error(`Shared members failed: ${sharedError.message}`)
            }

            const sharedUserIds = [...new Set((sharedMemberships ?? []).map((item) => item.user_id))]

            const { data: sharedUsers, error: usersError } = await supabase
              .from('users')
              .select('id, email, full_name, role')
              .in('id', sharedUserIds)

            if (usersError) {
              throw new Error(`Users failed: ${usersError.message}`)
            }

            memberRows = sharedUsers ?? []
          } else {
            memberRows = [profile]
          }
        }

        const memberMap = new Map()

        for (const member of memberRows) {
          if (!memberMap.has(member.id)) {
            memberMap.set(member.id, member)
          }
        }

        const uniqueMembers = Array.from(memberMap.values())

        let projectRows = []
        let taskRows = []

        if (profile.role === 'admin') {
          const { data: adminProjects, error: adminProjectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

          if (adminProjectsError) {
            throw new Error(`Projects failed: ${adminProjectsError.message}`)
          }

          projectRows = adminProjects ?? []

          if (projectRows.length > 0) {
            const projectIds = projectRows.map((project) => project.id)

            const { data: adminTasks, error: adminTasksError } = await supabase
              .from('tasks')
              .select('id, title, description, assigned_to, project_id, status, due_date')
              .in('project_id', projectIds)

            if (adminTasksError) {
              throw new Error(`Tasks failed: ${adminTasksError.message}`)
            }

            taskRows = adminTasks ?? []
          }
        } else {
          const { data: myMemberships } = await supabase
            .from('project_members')
            .select('project_id')
            .eq('user_id', user.id)

          const myProjectIds = [...new Set((myMemberships ?? []).map((item) => item.project_id))]

          if (myProjectIds.length > 0) {
            const { data: memberProjects, error: memberProjectsError } = await supabase
              .from('projects')
              .select('*')
              .in('id', myProjectIds)
              .order('created_at', { ascending: false })

            if (memberProjectsError) {
              throw new Error(`Projects failed: ${memberProjectsError.message}`)
            }

            projectRows = memberProjects ?? []
          }

          const { data: myTasks, error: myTasksError } = await supabase
            .from('tasks')
            .select('id, title, description, assigned_to, project_id, status, due_date')
            .eq('assigned_to', user.id)

          if (myTasksError) {
            throw new Error(`Tasks failed: ${myTasksError.message}`)
          }

          taskRows = myTasks ?? []
        }

        setMembers(uniqueMembers)
        setProjects(projectRows)
        setTasks(taskRows)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [profile, user?.id, navigate])

  const stats = useMemo(() => {
    let baseTasks = tasks

    if (selectedMember) {
      baseTasks = tasks.filter((task) => task.assigned_to === selectedMember.id)
    }

    const today = new Date().toISOString().split('T')[0]

    return {
      completed: baseTasks.filter((task) => task.status === 'done').length,
      overdue: baseTasks.filter((task) => task.status !== 'done' && task.due_date && task.due_date < today).length,
      pending: baseTasks.filter((task) => task.status !== 'done').length,
      total: baseTasks.length,
    }
  }, [selectedMember, tasks])

  const filteredProjects = useMemo(() => {
    if (!search) {
      return projects
    }

    const lowerSearch = search.toLowerCase()
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(lowerSearch) ||
        (project.description || '').toLowerCase().includes(lowerSearch),
    )
  }, [projects, search])

  const urgentTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]

    return tasks
      .filter((task) => {
        if (task.status === 'done') {
          return false
        }
        return task.due_date && task.due_date <= today
      })
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 5)
  }, [tasks])

  const commentsPreview = useMemo(
    () =>
      tasks.slice(0, 4).map((task, index) => ({
        id: task.id,
        message: task.description || 'Task logged and ready for follow-through.',
        owner:
          members.find((member) => member.id === task.assigned_to)?.full_name ||
          members.find((member) => member.id === task.assigned_to)?.email ||
          'Unassigned',
        title: task.title,
        tone: [
          'bg-slate-200 text-slate-900',
          'bg-blue-100 text-blue-900',
          'bg-emerald-100 text-emerald-900',
          'bg-amber-100 text-amber-900',
        ][index % 4],
      })),
    [members, tasks],
  )

  if (loading) {
    return <LoadingScreen label="Loading workspace..." />
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'there'}`}
        description="A calm view of current work, deadlines, and ownership across the workspace."
      />

      {errorMessage ? (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-5 py-4 text-sm font-medium text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="saas-card p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker mb-3">Today</p>
              <h3 className="text-2xl font-semibold tracking-tight text-white">Keep delivery moving.</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Use this space to scan active projects, catch overdue work early, and keep ownership visible without opening every record.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Local date</p>
              <p className="mt-1 text-sm font-semibold text-white">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="surface-outline p-4">
              <p className="text-sm font-medium text-slate-400">Visible projects</p>
              <p className="mt-2 text-2xl font-semibold text-white">{projects.length}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {profile?.role === 'admin'
                  ? 'Projects created and owned by this admin workspace.'
                  : 'Projects where you currently have access.'}
              </p>
            </div>
            <div className="surface-outline p-4">
              <p className="text-sm font-medium text-slate-400">People in view</p>
              <p className="mt-2 text-2xl font-semibold text-white">{members.length}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Enough context to see who owns what without leaving the workspace.</p>
            </div>
            <div className="surface-outline p-4">
              <p className="text-sm font-medium text-slate-400">Tasks requiring action</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stats.pending}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Open items that still need movement, review, or completion.</p>
            </div>
          </div>
        </div>

        <div className="saas-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker mb-3">Focus filter</p>
              <h3 className="text-lg font-semibold tracking-tight text-white">Member snapshot</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">Pick someone from the directory to scope the summary to their assigned work.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            {selectedMember ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{selectedMember.full_name || selectedMember.email}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{selectedMember.role}</p>
                </div>
                <button type="button" onClick={() => setSelectedMember(null)} className="btn-secondary px-3 py-2 text-xs">
                  Clear filter
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-white">All visible work</p>
                <p className="mt-1 text-sm text-slate-400">Metrics currently reflect everything visible in this workspace.</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/tasks" className="btn-primary">
              Open tasks
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/projects" className="btn-secondary">
              Review projects
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        <StatCard accent="text-blue-300" hint="Tasks currently visible in this workspace." icon={BriefcaseBusiness} label="Total tasks" value={stats.total} />
        <StatCard accent="text-emerald-300" hint="Items that have reached a done state." icon={CheckCircle2} label="Completed" value={stats.completed} />
        <StatCard accent="text-amber-300" hint="Everything still in motion or waiting on progress." icon={Clock3} label="Open work" value={stats.pending} />
        <StatCard accent="text-rose-300" hint="Open work with due dates already behind us." icon={AlertTriangle} label="Overdue" value={stats.overdue} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6">
          <div className="saas-card p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="section-kicker mb-3">Portfolio</p>
                <h3 className="text-xl font-semibold tracking-tight text-white">Project scan</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">Search active work and open the projects that need attention.</p>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm font-medium text-slate-500">
                  No projects match this search.
                </div>
              ) : (
                filteredProjects.slice(0, 4).map((project) => {
                  const state = getProjectStateMeta(project)
                  return (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="truncate pr-4 font-semibold text-white">{project.title}</h4>
                        <span className={`status-chip shrink-0 ${state.badge}`}>{state.label}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {project.description || 'No project summary has been added yet.'}
                      </p>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="saas-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker mb-3">Deadlines</p>
                  <h3 className="text-lg font-semibold tracking-tight text-white">Urgent tasks</h3>
                </div>
                <Clock3 className="h-5 w-5 text-amber-300" />
              </div>

              <div className="mt-6 space-y-3">
                {urgentTasks.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm font-medium text-slate-500">
                    No urgent tasks right now.
                  </p>
                ) : (
                  urgentTasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{task.title}</p>
                          <p className="mt-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                            Due {formatDate(task.due_date)}
                          </p>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="saas-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker mb-3">Signals</p>
                  <h3 className="text-lg font-semibold tracking-tight text-white">Recent task notes</h3>
                </div>
                <MessageSquareMore className="h-5 w-5 text-blue-300" />
              </div>

              <div className="mt-6 space-y-3">
                {commentsPreview.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm font-medium text-slate-500">
                    No recent activity yet.
                  </p>
                ) : (
                  commentsPreview.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.tone}`}>
                        {item.owner.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.owner}</p>
                        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">
                          {item.title}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{item.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <MemberDirectory members={members} onSelectMember={setSelectedMember} title="Workspace directory" />
      </section>

      <section className="saas-card p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-kicker mb-3">Rhythm</p>
            <h3 className="text-lg font-semibold tracking-tight text-white">What a healthy day looks like</h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
              Keep open work visible, clear overdue items before they stack up, and use the project pages when a task needs deeper context or a handoff.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <Users className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">{members.length} people visible in this workspace</span>
          </div>
        </div>
      </section>
    </div>
  )
}
