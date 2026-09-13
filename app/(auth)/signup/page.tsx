import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Crie sua conta no PipeFlow CRM e organize seu funil de vendas hoje.",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Criar conta"
      description="Comece no plano gratuito: 50 leads e 2 colaboradores, sem cartão."
      footer={
        <>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
