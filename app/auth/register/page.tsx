import { RegisterForm } from "@/components/auth/register-form"
import { AuthSplitLayout } from "@/components/auth/auth-split-layout"

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      title="Create an Account"
      subtitle="Join thousands of businesses using Elevate360 to grow their revenue"
    >
      <RegisterForm />
    </AuthSplitLayout>
  )
}