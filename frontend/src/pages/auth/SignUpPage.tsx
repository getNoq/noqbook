import { useNavigate } from 'react-router-dom'
import { SignUpForm } from '../../features/auth/AuthForms'

export default function SignUpPage() {
  const navigate = useNavigate()

  return (
    <main>
      <SignUpForm
        onSuccess={() => navigate('/dashboard')}
        onGoToLogin={() => navigate('/login')}
      />
    </main>
  )
}