import { LoaderCircle } from 'lucide-react'

export default function LoadingScreen({ label = 'Loading' }) {
  return (
    <div className="saas-card flex min-h-[40vh] items-center justify-center p-8">
      <div className="flex items-center gap-3 text-slate-300">
        <LoaderCircle className="h-5 w-5 animate-spin text-blue-300" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}
