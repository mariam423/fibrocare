import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create your account",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start logging your daily check-ins and gentle symptom trends."
    >
      <SignupForm />
    </AuthShell>
  );
}
