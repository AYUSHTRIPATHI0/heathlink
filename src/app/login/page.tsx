import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - HealthSync",
  description: "Login to your HealthSync account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
