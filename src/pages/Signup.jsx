import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabaseClient'
import { useAuthForm } from '../hooks/useAuthForm'
import { useToast } from '../hooks/useToast'

function validate(values) {
  const errors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function Signup() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const { errors, setErrors, updateValue, values } = useAuthForm({
    confirmPassword: '',
    email: '',
    fullName: '',
    password: '',
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setLoading(true)
    setAuthError('')

    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        data: {
          full_name: values.fullName.trim(),
          role: 'member',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setLoading(false)
      setAuthError(error.message)
      toast({
        title: 'Signup failed',
        description: error.message,
        type: 'error',
      })
      return
    }

    if (data.user) {
      await supabase.from('users').upsert(
        {
          email: data.user.email,
          full_name: values.fullName.trim(),
          id: data.user.id,
          role: 'member',
        },
        { onConflict: 'id' },
      )
    }

    setLoading(false)
    toast({
      title: 'Account created',
      description: data.session
        ? 'You are now signed in.'
        : 'Verify your email to activate this member account.',
      type: 'success',
    })

    navigate(
      data.session
        ? '/'
        : `/verify-email?email=${encodeURIComponent(values.email.trim())}`,
      { replace: true },
    )
  }

  return (
    <AuthShell
      activeAudience="member"
      eyebrow="Create account"
      title="Create your member account"
      description="Member signup is open here. Admin accounts should still be provisioned directly for workspace control."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="field-label">Full name</span>
          <input
            type="text"
            value={values.fullName}
            onChange={(event) => updateValue('fullName', event.target.value)}
            className="input-field mt-2"
            placeholder="Nishant Bhardwaj"
          />
          {errors.fullName ? <span className="mt-2 block text-sm text-rose-300">{errors.fullName}</span> : null}
        </label>

        <label className="block">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
            className="input-field mt-2"
            placeholder="designer@company.com"
          />
          {errors.email ? <span className="mt-2 block text-sm text-rose-300">{errors.email}</span> : null}
        </label>

        <label className="block">
          <span className="field-label">Password</span>
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
          <span className="field-label">Confirm password</span>
          <input
            type="password"
            value={values.confirmPassword}
            onChange={(event) => updateValue('confirmPassword', event.target.value)}
            className="input-field mt-2"
            placeholder="Repeat your password"
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already have a member account?{' '}
        <Link className="font-medium text-blue-300 transition hover:text-white" to="/login?audience=member">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
