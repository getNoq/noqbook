import { useNavigate, useSearchParams } from "react-router-dom";
import { ResetPasswordForm } from "../../features/auth/AuthForms";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  if (!token) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6 text-center">
        <p className="text-sm text-neutral-500">
          This reset link is missing or invalid. Request a new one from the
          login page.
        </p>
      </main>
    );
  }

  return (
    <main>
      <ResetPasswordForm token={token} onSuccess={() => navigate("/login")} />
    </main>
  );
}
