export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="section-kicker mb-3">{eyebrow}</p>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
    </div>
  )
}
