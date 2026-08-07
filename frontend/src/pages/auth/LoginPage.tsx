import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../../features/auth/AuthForms'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <main>
      <LoginForm
        onSuccess={() => navigate('/dashboard')}
        onGoToSignUp={() => navigate('/signup')}
        onGoToForgotPassword={() => navigate('/forgot-password')}
      />
    </main>
  )
}