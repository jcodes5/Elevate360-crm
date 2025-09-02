import { DualLayout } from "@/components/auth/dual-layout";
import { EnhancedLoginForm } from "@/components/auth/enhanced-login-form";

export default function LoginPage() {
  return (
    <DualLayout
      type="login"
      title="Welcome Back"
      subtitle="Sign in to your Elevate360 CRM account and continue building meaningful customer relationships."
    >
      <EnhancedLoginForm />
    </DualLayout>
  );
}
