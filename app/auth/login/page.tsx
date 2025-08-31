import { LoginForm } from "@/components/auth/login-form"
import { AuthSplitLayout } from "@/components/auth/auth-split-layout"

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Welcome Back"
      subtitle="Sign in to your Elevate360 CRM account to continue"
    >
      <LoginForm />
    </AuthSplitLayout>
  )
}