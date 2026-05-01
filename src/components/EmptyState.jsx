export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="saas-card border-dashed p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-blue-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
