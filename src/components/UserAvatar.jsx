import { cn } from '../lib/utils'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizes = {
    lg: 'h-14 w-14 text-base',
    md: 'h-10 w-10 text-sm',
    sm: 'h-8 w-8 text-xs',
    xl: 'h-20 w-20 text-xl',
  }

  const label = user?.full_name || user?.email || 'User'

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(135deg,#1a2230_0%,#243249_55%,#4e80ff_100%)] font-semibold text-white shadow-sm',
        sizes[size] ?? sizes.md,
        className,
      )}
    >
      {getInitials(label) || 'U'}
    </div>
  )
}
