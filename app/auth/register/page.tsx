import { DualLayout } from "@/components/auth/dual-layout";
import { EnhancedRegisterForm } from "@/components/auth/enhanced-register-form";

export default function RegisterPage() {
  return (
    <DualLayout
      type="register"
      title="Join Elevate360"
      subtitle="Create your account and start transforming your customer relationships today. Join thousands of businesses already growing with us."
    >
      <EnhancedRegisterForm />
    </DualLayout>
  );
}
