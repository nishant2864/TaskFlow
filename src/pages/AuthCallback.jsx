import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabaseClient'

function parseHash() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
  return new URLSearchParams(hash)
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const resolveCallback = async () => {
      const hashParams = parseHash()
      const code = searchParams.get('code')
      const next = searchParams.get('next')
      const callbackType = hashParams.get('type') || searchParams.get('type')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          toast({
            title: 'Auth callback failed',
            description: error.message,
            type: 'error',
          })
          navigate('/login?audience=member', { replace: true })
          return
        }
      } else {
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })

          if (error) {
            toast({
              title: 'Session restore failed',
              description: error.message,
              type: 'error',
            })
            navigate('/login?audience=member', { replace: true })
            return
          }
        }
      }

      if (callbackType === 'recovery' || next === '/reset-password') {
        navigate('/reset-password', { replace: true })
        return
      }

      toast({
        title: 'Email verified',
        description: 'Your email has been confirmed. Sign in to continue.',
        type: 'success',
      })
      await supabase.auth.signOut()
      navigate('/login?audience=member&verified=1', { replace: true })
    }

    resolveCallback()
  }, [navigate, searchParams, toast])

  return <LoadingScreen label="Completing authentication" />
}
