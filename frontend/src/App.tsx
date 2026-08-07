import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import ProtectedRoute from './features/auth/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import GuestInvoicePage from './pages/GuestInvoicePage'
import SignUpPage from './pages/auth/SignUpPage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start" element={<GuestInvoicePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}