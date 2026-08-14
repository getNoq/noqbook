import { Routes, Route, Navigate } from 'react-router-dom'
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
import WhoOwesMePage from './pages/WhoOwesMePage'
import ExpenseDetailPage from './pages/ExpenseDetailPage'
import SettingsLayoutPage from './pages/settings/SettingsLayoutPage'
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage'
import PasswordSettingsPage from './pages/settings/PasswordSettingsPage'
import PlanSettingsPage from './pages/settings/PlanSettingsPage'
import BillingSettingsPage from './pages/settings/BillingSettingsPage'
import TeamSettingsPage from './pages/settings/TeamSettingsPage'
import { ScrollToTop } from './components/ScrollToTop'

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start" element={<GuestInvoicePage />} />
        <Route path="/signup" element={<GuestOnlyRoute><SignUpPage /></GuestOnlyRoute>} />
        <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
        <Route path="/forgot-password" element={<GuestOnlyRoute><ForgotPasswordPage /></GuestOnlyRoute>} />
        <Route path="/reset-password" element={<GuestOnlyRoute><ResetPasswordPage /></GuestOnlyRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/owed" element={<ProtectedRoute><WhoOwesMePage /></ProtectedRoute>} />
        <Route path="/dashboard/sales/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
        <Route path="/dashboard/expenses/:id" element={<ProtectedRoute><ExpenseDetailPage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsLayoutPage /></ProtectedRoute>}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="password" element={<PasswordSettingsPage />} />
          <Route path="plan" element={<PlanSettingsPage />} />
          <Route path="billing" element={<BillingSettingsPage />} />
          <Route path="team" element={<TeamSettingsPage />} />
        </Route>
      </Routes>
      <WhatsAppWidget />
    </AuthProvider>
  )
}