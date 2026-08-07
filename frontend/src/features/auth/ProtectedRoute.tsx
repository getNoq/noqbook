import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null // swap for a spinner if you have one
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}