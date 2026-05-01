import { ArrowUpRight } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, accent, hint }) {
  return (
    <div className="saas-card p-5 transition-colors hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
          <Icon className={`h-5 w-5 ${accent || 'text-white'}`} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-600" />
      </div>
      <div className="mt-6">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-white">{value}</p>
        {hint ? <p className="mt-3 text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
    </div>
  )
}
