import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse seu pipeline de vendas no PipeFlow CRM.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Entrar"
      description="Acesse seu pipeline e continue de onde parou."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
