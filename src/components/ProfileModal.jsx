import { useState } from 'react'
import { LoaderCircle, Mail, PencilLine, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabaseClient'
import Modal from './Modal'
import UserAvatar from './UserAvatar'

export default function ProfileModal({ onClose, userProfile }) {
  const { profile, refreshProfile, user } = useAuth()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState(userProfile?.full_name || '')

  const isCurrentUser = userProfile?.id === user?.id

  const handleSave = async (event) => {
    event.preventDefault()

    if (!isCurrentUser) {
      return
    }

    setSaving(true)

    const nextName = fullName.trim() || null
    const { error } = await supabase
      .from('users')
      .update({ full_name: nextName })
      .eq('id', user.id)

    if (!error) {
      await supabase.auth.updateUser({
        data: {
          full_name: nextName,
        },
      })
    }

    setSaving(false)

    if (error) {
      toast({
        title: 'Profile update failed',
        description: error.message,
        type: 'error',
      })
      return
    }

    await refreshProfile(user)
    setEditing(false)
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been saved.',
      type: 'success',
    })
  }

  return (
    <Modal
      title={isCurrentUser ? 'My profile' : 'Team member profile'}
      description={isCurrentUser ? 'Review your account details and keep your name current.' : 'Directory profile visible to everyone who shares the workspace.'}
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <UserAvatar user={userProfile} size="xl" />
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-white">
              {userProfile?.full_name || userProfile?.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                <Mail className="h-4 w-4 text-slate-500" />
                {userProfile?.email}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {userProfile?.role === 'admin' ? (
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                ) : (
                  <UserRound className="h-4 w-4 text-blue-300" />
                )}
                {userProfile?.role}
              </span>
            </div>
          </div>
        </div>

        {isCurrentUser ? (
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="flex items-center justify-between">
              <p className="section-kicker">
                Profile details
              </p>
              <button
                type="button"
                onClick={() => setEditing((current) => !current)}
                className="btn-secondary px-3"
              >
                <PencilLine className="h-4 w-4" />
                {editing ? 'Cancel edit' : 'Edit profile'}
              </button>
            </div>

            <label className="block">
              <span className="field-label">Full name</span>
              <input
                type="text"
                disabled={!editing}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="input-field mt-2 disabled:bg-white/[0.02] disabled:text-slate-500"
                placeholder="Your full name"
              />
            </label>

            <label className="block">
              <span className="field-label">Email</span>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="input-field mt-2 bg-white/[0.02] text-slate-500"
              />
            </label>

            {editing ? (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  Save profile
                </button>
              </div>
            ) : null}
          </form>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
            This profile is visible in your team directory. Members can edit only their own profile.
          </div>
        )}
      </div>
    </Modal>
  )
}
