import UserAvatar from './UserAvatar'

export default function MemberDirectory({ members, onSelectMember, title = 'Team directory' }) {
  return (
    <div className="saas-card p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker mb-3">People</p>
          <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">Open a profile to check role and contact details.</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => onSelectMember(member)}
            className="group flex w-full items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <div className="shrink-0">
              <UserAvatar user={member} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{member.full_name || member.email}</p>
              <p className="truncate text-[11px] text-slate-400 mt-0.5">{member.email}</p>
              <p className="mt-1.5 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.24em] text-slate-300">{member.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
