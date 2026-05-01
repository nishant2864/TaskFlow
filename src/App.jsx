import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthCallback from './pages/AuthCallback'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'

import ProjectDetails from './pages/ProjectDetails'
import Projects from './pages/Projects'
import ResetPassword from './pages/ResetPassword'
import Reports from './pages/Reports'
import Signup from './pages/Signup'
import Tasks from './pages/Tasks'
import VerifyEmail from './pages/VerifyEmail'
import Onboarding from './pages/Onboarding'

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  return user ? <Navigate to="/" replace /> : children
}

function AppRoutes() {
  const { profile } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <PublicOnlyRoute>
            <VerifyEmail />
          </PublicOnlyRoute>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        {profile?.role === 'admin' && <Route path="reports" element={<Reports />} />}
        <Route path="tasks" element={<Tasks />} />
        <Route path="onboarding" element={<Onboarding />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
