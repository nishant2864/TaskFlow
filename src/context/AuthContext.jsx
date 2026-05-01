/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withTimeout } from '../lib/utils'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

async function createUserRecord(user) {
  if (!user?.id || !user?.email) {
    return null
  }

  const fullName = user.user_metadata?.full_name?.trim() || null

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      role: 'member',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (authUser) => {
    if (!authUser?.id) {
      setProfile(null)
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (data) {
      setProfile(data)
      return data
    }

    const createdProfile = await createUserRecord(authUser)
    setProfile(createdProfile)
    return createdProfile
  }, [])

  const hydrateProfile = useCallback(
    async (authUser) => {
      if (!authUser?.id) {
        setProfile(null)
        return null
      }

      try {
        return await withTimeout(
          refreshProfile(authUser),
          8000,
          'Profile lookup took too long.',
        )
      } catch {
        setProfile(null)
        return null
      }
    },
    [refreshProfile],
  )

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        if (mounted) {
          setLoading(false)
        }
        return
      }

      const activeSession = data.session

      if (!mounted) {
        return
      }

      setSession(activeSession)
      setUser(activeSession?.user ?? null)
      setLoading(false)

      if (activeSession?.user) {
        void hydrateProfile(activeSession.user)
      } else {
        setProfile(null)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)

      if (nextSession?.user) {
        void hydrateProfile(nextSession.user)
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [hydrateProfile])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        profile,
        refreshProfile,
        session,
        signOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
