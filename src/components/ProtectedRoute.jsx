import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children }) {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen label="Restoring your workspace" />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
