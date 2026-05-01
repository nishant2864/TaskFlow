import { CheckSquare2, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthShell({ children, eyebrow, title, description, activeAudience = 'member' }) {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f3f6fb]">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#4e80ff] text-sm font-bold tracking-[0.14em] text-white">
                TF
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">TaskFlow</p>
                <p className="text-sm font-medium text-slate-300">Delivery workspace</p>
              </div>
            </div>

            <p className="section-kicker mb-3">{eyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#141922]/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
              {children}
            </div>
          </div>
        </div>

        <div className="hidden border-l border-white/10 bg-[#10151d] lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-sm font-medium text-blue-200">
              <Sparkles className="h-4 w-4" />
              Focused delivery, not dashboard theater
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white">
              Keep projects, owners, and deadlines in one clean operating view.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              TaskFlow is built for teams that want calm visibility: clear ownership, simple status updates, and fewer places where work can disappear.
            </p>
          </div>

          <div className="grid gap-4">
            <Link
              to="/login?audience=admin"
              className={`group rounded-2xl border p-5 transition-all ${
                activeAudience === 'admin'
                  ? 'border-blue-400/20 bg-blue-400/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <ShieldCheck className="h-5 w-5 text-blue-300" />
                <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
              </div>
              <p className="mt-4 text-base font-semibold text-white">Admin portal</p>
              <p className="mt-1 text-sm text-slate-400">Manage the portfolio, membership, and reporting view.</p>
            </Link>
            <Link
              to="/login?audience=member"
              className={`group rounded-2xl border p-5 transition-all ${
                activeAudience === 'member'
                  ? 'border-blue-400/20 bg-blue-400/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <CheckSquare2 className="h-5 w-5 text-blue-300" />
                <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
              </div>
              <p className="mt-4 text-base font-semibold text-white">Member portal</p>
              <p className="mt-1 text-sm text-slate-400">Track your assignments, deadlines, and status updates.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
