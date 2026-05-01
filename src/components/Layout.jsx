import { useMemo, useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import ProfileModal from './ProfileModal'
import UserAvatar from './UserAvatar'

const baseNavItems = [
  { icon: LayoutDashboard, label: 'Control center', to: '/' },
  { icon: FolderKanban, label: 'Projects', to: '/projects' },
  { icon: CheckSquare, label: 'Tasks', to: '/tasks' },
]

const routeLabels = {
  '/': { eyebrow: 'Overview', title: 'Workspace control center' },
  '/onboarding': { eyebrow: 'Setup', title: 'Welcome' },
  '/projects': { eyebrow: 'Portfolio', title: 'Projects' },
  '/reports': { eyebrow: 'Reporting', title: 'Delivery reports' },
  '/tasks': { eyebrow: 'Execution', title: 'Task queue' },
}

function getRouteMeta(pathname) {
  if (pathname.startsWith('/projects/')) {
    return {
      eyebrow: 'Project workspace',
      title: 'Project details',
    }
  }

  return routeLabels[pathname] ?? routeLabels['/']
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const navItems = useMemo(
    () =>
      profile?.role === 'admin'
        ? [
            baseNavItems[0],
            baseNavItems[1],
            { icon: PieChart, label: 'Reports', to: '/reports' },
            baseNavItems[2],
          ]
        : baseNavItems,
    [profile?.role],
  )

  const routeMeta = getRouteMeta(location.pathname)

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: 'Logged out',
        description: 'Your session has been cleared.',
        type: 'success',
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error.message,
        type: 'error',
      })
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-[#f3f6fb]">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-[19rem] flex-col border-r border-white/10 bg-[#0f141c]/95 px-5 py-6 backdrop-blur lg:static lg:translate-x-0',
            'transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-start justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#4e80ff] text-sm font-bold tracking-[0.14em] text-white">
                TF
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">TaskFlow</p>
                <p className="text-base font-semibold text-white">Delivery workspace</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="section-kicker mb-3">Workspace mode</p>
            <p className="text-sm leading-6 text-slate-300">
              {profile?.role === 'admin'
                ? 'Run the portfolio, assign ownership, and close out work with a single view.'
                : 'Stay focused on assigned work, deadlines, and the next handoff.'}
            </p>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Navigation
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <div
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'border border-blue-400/20 bg-blue-400/10 text-white'
                        : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-slate-100',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4',
                        isActive ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-300',
                      )}
                    />
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-4 px-1">
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <UserAvatar user={profile} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{profile?.full_name || 'Workspace user'}</p>
                <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  {profile?.role}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-300">
                {profile?.role === 'admin' ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary w-full justify-start px-3 text-slate-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0d1117]/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="section-kicker mb-1">{routeMeta.eyebrow}</p>
                  <p className="text-lg font-semibold tracking-tight text-white">{routeMeta.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 lg:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-slate-300">Synced</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfile(true)}
                  className="rounded-full transition-transform hover:scale-[1.02]"
                >
                  <UserAvatar user={profile} size="sm" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {showProfile ? <ProfileModal onClose={() => setShowProfile(false)} userProfile={profile} /> : null}
    </div>
  )
}
