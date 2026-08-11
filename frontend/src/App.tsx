import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import ProtectedRoute from './features/auth/ProtectedRoute'
import GuestOnlyRoute from './features/auth/GuestOnlyRoute'

import LandingPage from './pages/LandingPage'
import GuestInvoicePage from './pages/GuestInvoicePage'
import SignUpPage from './pages/auth/SignUpPage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import WhatsAppWidget from './components/landing/WhatsAppWidget'
import InvoiceDetailPage from './pages/InvoiceDetailPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start" element={<GuestInvoicePage />} />
        <Route path="/signup" element={<GuestOnlyRoute><SignUpPage /></GuestOnlyRoute>} />
        <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
        <Route path="/forgot-password" element={<GuestOnlyRoute><ForgotPasswordPage /></GuestOnlyRoute>} />
        <Route path="/reset-password" element={<GuestOnlyRoute><ResetPasswordPage /></GuestOnlyRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <WhatsAppWidget />
    </AuthProvider>
  )
}