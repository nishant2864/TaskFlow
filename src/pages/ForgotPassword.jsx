import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabaseClient'
import { useAuthForm } from '../hooks/useAuthForm'
import { useToast } from '../hooks/useToast'

export default function ForgotPassword() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { errors, setErrors, updateValue, values } = useAuthForm({ email: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!values.email.trim()) {
      nextErrors.email = 'Email is required.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast({
        title: 'Reset email failed',
        description: error.message,
        type: 'error',
      })
      return
    }

    setSent(true)
    toast({
      title: 'Reset email sent',
      description: 'Check your inbox for the password reset link.',
      type: 'success',
    })
  }

  return (
    <AuthShell
      activeAudience="member"
      eyebrow="Password recovery"
      title="Send a reset link"
      description="We will email a secure reset link to the account you enter here."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {sent ? (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Reset instructions sent. Open the link from your email to continue.
          </div>
        ) : null}

        <label className="block">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
            className="input-field mt-2"
            placeholder="member@company.com"
          />
          {errors.email ? <span className="mt-2 block text-sm text-rose-300">{errors.email}</span> : null}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Sending link...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Back to{' '}
        <Link className="font-medium text-blue-300 transition hover:text-white" to="/login?audience=member">
          member sign in
        </Link>
      </p>
    </AuthShell>
  )
}
