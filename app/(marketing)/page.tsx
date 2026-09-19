import type { Metadata } from "next";

import { Features } from "@/components/marketing/features";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { Pricing } from "@/components/marketing/pricing";
import { Results } from "@/components/marketing/results";

/**
 * Landing page — PLAN.md M3.
 *
 * The title is absolute because the root layout applies the template
 * `%s · PipeFlow CRM`, and "PipeFlow CRM · PipeFlow CRM" is what that would
 * produce on the one page whose subject is the product itself.
 */
const DESCRIPTION =
  "CRM de vendas com pipeline Kanban, gestão de leads, timeline de atividades e dashboard de métricas. Plano gratuito de verdade: 2 membros e 50 leads, sem cartão.";

export const metadata: Metadata = {
  title: { absolute: "PipeFlow CRM — seu funil de vendas em uma tela" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "PipeFlow CRM",
    title: "PipeFlow CRM — seu funil de vendas em uma tela",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "PipeFlow CRM — seu funil de vendas em uma tela",
    description: DESCRIPTION,
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Results />
      <Features />
      <Pricing />
      <FinalCta />
    </>
  );
}
