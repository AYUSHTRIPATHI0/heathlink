import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - HealthSync",
  description: "Create a new account on HealthSync.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
