import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Pencil, Plus, Trash2, Users } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import LoadingScreen from '../components/LoadingScreen'
import PageHeader from '../components/PageHeader'
import ProjectFormModal from '../components/ProjectFormModal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabaseClient'
import { getProjectStateMeta } from '../lib/utils'

const emptyForm = {
  description: '',
  title: '',
}

export default function Projects() {
  const { profile, user } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState([])
  const [memberCounts, setMemberCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectModalMode, setProjectModalMode] = useState('create')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deletingProject, setDeletingProject] = useState(false)

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    const run = async () => {
      if (!user?.id) {
        return
      }

      setLoading(true)

      let projectRows = []

      if (isAdmin) {
        const { data, error } = await supabase.from('projects').select('*').eq('created_by', user.id)

        if (error) {
          toast({
            title: 'Unable to load projects',
            description: error.message,
            type: 'error',
          })
        }

        projectRows = data ?? []
      } else {
        const { data: memberships, error: membersError } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', user.id)

        if (membersError) {
          toast({
            title: 'Unable to load memberships',
            description: membersError.message,
            type: 'error',
          })
        }

        const projectIds = [...new Set((memberships ?? []).map((item) => item.project_id))]

        if (projectIds.length > 0) {
          const { data, error } = await supabase.from('projects').select('*').in('id', projectIds)

          if (error) {
            toast({
              title: 'Unable to load projects',
              description: error.message,
              type: 'error',
            })
          }

          projectRows = data ?? []
        }
      }

      if (projectRows.length > 0) {
        const { data: members } = await supabase
          .from('project_members')
          .select('project_id, user_id')
          .in('project_id', projectRows.map((project) => project.id))

        const counts = (members ?? []).reduce((accumulator, item) => {
          accumulator[item.project_id] = (accumulator[item.project_id] ?? 0) + 1
          return accumulator
        }, {})

        setMemberCounts(counts)
      } else {
        setMemberCounts({})
      }

      setProjects(projectRows)
      setLoading(false)
    }

    run()
  }, [isAdmin, toast, user?.id])

  const projectSummary = useMemo(
    () => (projects.length === 1 ? '1 project visible' : `${projects.length} projects visible`),
    [projects.length],
  )

  const openCreateProject = () => {
    setProjectModalMode('create')
    setSelectedProject(null)
    setForm(emptyForm)
    setShowProjectModal(true)
  }

  const openEditProject = (project) => {
    setProjectModalMode('edit')
    setSelectedProject(project)
    setForm({
      description: project.description || '',
      title: project.title || '',
    })
    setShowProjectModal(true)
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    if (projectModalMode === 'create') {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          created_by: user.id,
          description: form.description.trim(),
          title: form.title.trim(),
        })
        .select('*')
        .single()

      if (error) {
        setSubmitting(false)
        toast({
          title: 'Project creation failed',
          description: error.message,
          type: 'error',
        })
        return
      }

      const { error: memberError } = await supabase.from('project_members').insert({
        project_id: data.id,
        user_id: user.id,
      })

      if (memberError) {
        setSubmitting(false)
        toast({
          title: 'Project created but membership failed',
          description: memberError.message,
          type: 'error',
        })
        return
      }

      setProjects((current) => [data, ...current])
      setMemberCounts((current) => ({ ...current, [data.id]: 1 }))
      setShowProjectModal(false)
      setForm(emptyForm)
      setSubmitting(false)
      toast({
        title: 'Project created',
        description: `${data.title} is now available.`,
        type: 'success',
      })
      return
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        description: form.description.trim(),
        title: form.title.trim(),
      })
      .eq('id', selectedProject.id)
      .select('*')
      .single()

    setSubmitting(false)

    if (error) {
      toast({
        title: 'Project update failed',
        description: error.message,
        type: 'error',
      })
      return
    }

    setProjects((current) => current.map((project) => (project.id === data.id ? data : project)))
    setShowProjectModal(false)
    setSelectedProject(null)
    setForm(emptyForm)
    toast({
      title: 'Project updated',
      description: `${data.title} has been updated.`,
      type: 'success',
    })
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) {
      return
    }

    setDeletingProject(true)

    const { error: tasksError } = await supabase.from('tasks').delete().eq('project_id', projectToDelete.id)

    if (tasksError) {
      setDeletingProject(false)
      toast({
        title: 'Project delete failed',
        description: tasksError.message,
        type: 'error',
      })
      return
    }

    const { error: membersError } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectToDelete.id)

    if (membersError) {
      setDeletingProject(false)
      toast({
        title: 'Project delete failed',
        description: membersError.message,
        type: 'error',
      })
      return
    }

    const { error: projectError } = await supabase.from('projects').delete().eq('id', projectToDelete.id)

    setDeletingProject(false)

    if (projectError) {
      toast({
        title: 'Project delete failed',
        description: projectError.message,
        type: 'error',
      })
      return
    }

    setProjects((current) => current.filter((project) => project.id !== projectToDelete.id))
    setProjectToDelete(null)
    toast({
      title: 'Project deleted',
      description: 'The project and related records were removed.',
      type: 'success',
    })
  }

  if (loading) {
    return <LoadingScreen label="Loading projects..." />
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portfolio"
        title="Project directory"
        description="A single place to create, review, and maintain the projects that shape your delivery pipeline."
        action={
          isAdmin ? (
            <button type="button" onClick={openCreateProject} className="btn-primary">
              <Plus className="h-4 w-4" />
              New project
            </button>
          ) : null
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="saas-card p-6 lg:p-8">
          <p className="section-kicker mb-3">At a glance</p>
          <h3 className="text-xl font-semibold tracking-tight text-white">Keep the portfolio readable.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Each project should make sense on first scan: concise title, useful summary, visible status, and a clear member count.
          </p>
        </div>

        <div className="saas-card p-6">
          <p className="section-kicker mb-3">Coverage</p>
          <p className="text-3xl font-semibold tracking-tight text-white">{projectSummary}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {isAdmin
              ? 'These are the projects currently managed from this admin workspace.'
              : 'These are the projects you can see through current memberships.'}
          </p>
        </div>
      </section>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create the first project to establish scope and ownership, or wait until a project is shared with you."
          action={
            isAdmin ? (
              <button type="button" onClick={openCreateProject} className="btn-primary">
                Create project
              </button>
            ) : null
          }
        />
      ) : (
        <section className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {projects.map((project) => {
            const state = getProjectStateMeta(project)

            return (
              <div key={project.id} className="saas-card flex h-full flex-col p-6 transition-all duration-200 hover:border-white/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-blue-300">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <span className={`status-chip ${state.badge}`}>{state.label}</span>
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {project.description || 'No project summary has been added yet.'}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                  <Users className="h-4 w-4" />
                  {memberCounts[project.id] ?? 0} members
                </div>

                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to={`/projects/${project.id}`} className="btn-secondary py-2 text-xs">
                      Open workspace
                    </Link>

                    {isAdmin ? (
                      <>
                        <button type="button" onClick={() => openEditProject(project)} className="btn-secondary px-3 py-2 text-xs">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button type="button" onClick={() => setProjectToDelete(project)} className="btn-danger ml-auto px-3 py-2 text-xs">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {showProjectModal ? (
        <ProjectFormModal
          form={form}
          mode={projectModalMode}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
          onClose={() => setShowProjectModal(false)}
          onSubmit={handleProjectSubmit}
          submitting={submitting}
        />
      ) : null}

      {projectToDelete ? (
        <ConfirmModal
          title="Delete project"
          description="This removes the project, its memberships, and every linked task."
          confirmLabel="Delete project"
          loading={deletingProject}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleDeleteProject}
        />
      ) : null}
    </div>
  )
}
