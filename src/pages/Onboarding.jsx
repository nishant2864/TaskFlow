import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, FolderKanban, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Onboarding() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const handleFinish = () => {
    localStorage.setItem('has_seen_onboarding', 'true')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] p-4 text-[#f3f6fb] font-sans">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#141922] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="p-8 md:p-12">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#4e80ff]">
            <span className="text-sm font-bold tracking-[0.16em]">TF</span>
          </div>

          <p className="section-kicker mb-3">Welcome</p>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Good to see you, {profile?.full_name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="mb-10 max-w-2xl text-base leading-7 text-slate-400">
            TaskFlow keeps your day centered on active projects, owned tasks, and the decisions that unblock delivery. Here is the shape of the workspace before you jump in.
          </p>

          <div className="space-y-6 mb-12">
            <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Project rooms</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">Keep every initiative in one place with a shared summary, member list, and task stream.</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Daily execution</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">Track assignments, deadlines, and status changes without losing context from one page to the next.</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Clear access rules</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">Admins shape the workspace. Members stay focused on the work assigned to them.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end border-t border-white/10 pt-8">
            <button
              onClick={handleFinish}
              className="btn-primary px-6 py-3"
            >
              Enter workspace
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
