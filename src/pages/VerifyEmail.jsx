import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../hooks/useToast'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const { toast } = useToast()
  const [sending, setSending] = useState(false)

  const handleResend = async () => {
    if (!email) {
      return
    }

    setSending(true)
    const { error } = await supabase.auth.resend({
      email,
      type: 'signup',
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setSending(false)

    if (error) {
      toast({
        title: 'Verification resend failed',
        description: error.message,
        type: 'error',
      })
      return
    }

    toast({
      title: 'Verification email sent',
      description: 'Check your inbox for the confirmation link.',
      type: 'success',
    })
  }

  return (
    <AuthShell
      activeAudience="member"
      eyebrow="Verify email"
      title="Check your inbox"
      description="Open the verification email to activate the account. Once confirmed, you can sign in through the member portal."
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 px-4 py-4 text-sm text-blue-200">
          Verification link sent to <span className="font-semibold">{email || 'your email'}</span>.
        </div>

        <button
          type="button"
          disabled={sending || !email}
          onClick={handleResend}
          className="btn-secondary w-full"
        >
          {sending ? 'Resending...' : 'Resend verification email'}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <span>Already verified?</span>
        <Link className="font-medium text-blue-300 transition hover:text-white" to="/login?audience=member">
          Go to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
