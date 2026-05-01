import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabaseClient'
import { useAuthForm } from '../hooks/useAuthForm'
import { useToast } from '../hooks/useToast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const { errors, setErrors, updateValue, values } = useAuthForm({
    confirmPassword: '',
    password: '',
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}

    if (!values.password) {
      nextErrors.password = 'Password is required.'
    } else if (values.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    setAuthError('')

    const { error } = await supabase.auth.updateUser({ password: values.password })
    setLoading(false)

    if (error) {
      setAuthError(error.message)
      toast({
        title: 'Password update failed',
        description: error.message,
        type: 'error',
      })
      return
    }

    toast({
      title: 'Password updated',
      description: 'Sign in with your new password.',
      type: 'success',
    })
    await supabase.auth.signOut()
    navigate('/login?audience=member&reset=1', { replace: true })
  }

  return (
    <AuthShell
      activeAudience="member"
      eyebrow="Reset password"
      title="Create a new password"
      description="Choose a password you can remember and reuse your member sign-in flow once it is saved."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="field-label">New password</span>
          <input
            type="password"
            value={values.password}
            onChange={(event) => updateValue('password', event.target.value)}
            className="input-field mt-2"
            placeholder="Minimum 6 characters"
          />
          {errors.password ? <span className="mt-2 block text-sm text-rose-300">{errors.password}</span> : null}
        </label>

        <label className="block">
          <span className="field-label">Confirm new password</span>
          <input
            type="password"
            value={values.confirmPassword}
            onChange={(event) => updateValue('confirmPassword', event.target.value)}
            className="input-field mt-2"
            placeholder="Repeat new password"
          />
          {errors.confirmPassword ? (
            <span className="mt-2 block text-sm text-rose-300">{errors.confirmPassword}</span>
          ) : null}
        </label>

        {authError ? (
          <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {authError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Updating password...' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}
