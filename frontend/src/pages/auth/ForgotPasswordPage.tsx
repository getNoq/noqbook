import { useNavigate } from 'react-router-dom'
import { ForgotPasswordForm } from '../../features/auth/AuthForms'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  return (
    <main>
      <ForgotPasswordForm onGoToLogin={() => navigate('/login')} />
    </main>
  )
}