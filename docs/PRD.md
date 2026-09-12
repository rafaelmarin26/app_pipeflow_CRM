# PROJECT ARCHITECTURE: PipeFlow CRM

> **Produto:** PipeFlow CRM
> **Versão do documento:** 1.0
> **Data:** 12/09/2026
> **Status:** Aprovado — base para implementação
> **Briefing técnico:** [CLAUDE.md](../CLAUDE.md)

## 1. CONTEXT & PROBLEM

Pequenas e médias empresas, freelancers e times de vendas perdem oportunidades de negócio por falta de organização no processo comercial. Leads são gerenciados em planilhas, anotações soltas ou ferramentas genéricas que não oferecem visão clara do funil de vendas.

Não há registro centralizado de interações com clientes, e quando a equipe cresce, os dados ficam espalhados sem controle de acesso por empresa/time.

Soluções como HubSpot e Pipedrive existem, mas são caras ou complexas demais para quem está começando.

## 2. PROPOSED SOLUTION

Construir o PipeFlow CRM — uma plataforma SaaS de gestão de clientes e vendas, multi-empresa, com pipeline visual Kanban, gestão completa de leads e negócios, registro de interações e integração de pagamento para monetização.

CRM completo com cadastro de leads/contatos (nome, e-mail, telefone, empresa, cargo)
Pipeline Kanban de vendas com drag-and-drop entre etapas
Página de detalhe do lead com histórico completo de atividades
Sistema multi-empresa com convite de colaboradores por e-mail
Dashboard com métricas de vendas e gráfico de funil
Monetização via planos de assinatura
Landing page de apresentação do produto

## 3. FUNCTIONAL REQUIREMENTS

- Login e Autenticação
- Kanban
- Dashboards
- Multi usuário
- Multi empresa
- Permissões por usuário
- Parte premium (paga)
- Integrações (API)
- Busca e Filtros
- Landing Page
- Onboarding do Usuário

### Gestão de Leads e Contatos

- Cadastro completo: nome, e-mail, telefone, empresa, cargo, status
- Listagem com busca e filtros (por status, responsável, data)
- Página de detalhe com perfil completo e timeline de atividades

### Pipeline Kanban de Vendas

- Colunas por etapa: Novo Lead, Contato Realizado, Proposta Enviada, Negociação, Fechado Ganho e Fechado Perdido
- Cards de negócios com: Título, Valor estimado (R$), Lead vinculado, Responsável e Prazo
- Drag-and-drop entre etapas com persistência no banco

### Registro de Atividades

- Tipos: Ligação, E-mail, Reunião e Nota
- Campos: Autor, Descrição e Data
- Timeline cronológica vinculada ao lead

### Dashboard de Métricas

- Cards: Total de leads, Negócios abertos, Valor total do pipeline e Taxa de conversão
- Gráfico de funil de vendas (Recharts)
- Negócios do usuário logado com prazo próximo

### Multi-empresa e Colaboração

- Criar workspaces (cada empresa/time = 1 workspace)
- Convite de colaboradores por e-mail (com Resend)
- Papéis: Admin (acesso total) e Membro (leads e negócios)
- Alternar entre workspaces via dropdown na sidebar
- Isolamento de dados via Row Level Security (RLS) no Supabase

### Monetização (Stripe)

- Plano Free: até 2 colaboradores e 50 leads
- Plano Pro: colaboradores e leads ilimitados (R$49/mês)
- Checkout integrado via Stripe Checkout
- Webhook para ativar/desativar plano automaticamente
- Customer Portal do Stripe para gerenciamento de assinatura

### Landing Page

- Página pública de apresentação do PipeFlow CRM
- Seções: Hero, Funcionalidades, Planos e preços, CTA

## 4. USER PERSONAS

### **Dono do Negócio / Empreendedor (Admin)**

Pequeno empresário que precisa organizar seu processo de vendas. Cria o workspace, convida o time, gerencia planos e possui acesso completo às funcionalidades.

### **Vendedor / Colaborador (Membro)**

Profissional de vendas que utiliza o CRM no dia a dia. Cadastra leads, move negócios no pipeline e registra atividades. Pode participar de múltiplos workspaces.

### **Freelancer / Consultor (Admin Solo)**

Profissional independente que atende vários clientes. Utiliza workspaces separados para cada cliente/projeto. Começa no plano Free e faz upgrade conforme cresce.

## 5. TECHNICAL STACK

- Next.js
- React
- Tailwind CSS
- shadcn/ui
- Supabase
- Stripe
- Vercel
- Claude Code
- Node.js
- PostgreSQL
- TypeScript
- Resend (e-mails)

- Frontend: Next.js 14 (App Router) + React 18 + Tailwind CSS + shadcn/ui [^1]
- Backend/API: Next.js API Routes (Server Components)
- Banco de Dados + Auth: Supabase (PostgreSQL + RLS + Auth)
- Pagamento: Stripe (checkout + webhooks)
- E-mail transacional: Resend
- Drag-and-drop: @dnd-kit
- Gráficos: Recharts
- Versionamento: Git + GitHub
- Deploy: Vercel + Supabase
- IDE: Cursor com Claude Code no terminal
- Linguagem: TypeScript 5

## 6. DESIGN LANGUAGE

Referências: HubSpot CRM, Pipedrive e DataCrazy.

### HubSpot CRM

- CRM gratuito mais popular do mercado
- Pipeline visual, gestão de contatos e automações de marketing
- Pontos fortes: ecossistema completo, integrações abundantes
- Pontos fracos: complexo para PMEs e planos caros
- Insight: simplificar a experiência focando apenas em vendas

### Pipedrive

- CRM focado em vendas com pipeline visual excelente
- Pontos fortes: UX intuitiva e pipeline Kanban referência de mercado
- Pontos fracos: ausência de plano gratuito e recursos avançados caros
- Insight: modelo freemium acessível inspirado no Pipedrive

## 7. PROCESS

- Break app build into logical milestones (steps)
- Each milestone should be a deliverable increment
- Prioritize core functionality first, then iterate
- Test each milestone before moving to the next

---

## Notas de implementação

Divergências deliberadas entre este PRD e o que será construído. Registradas aqui para que o documento não conflite silenciosamente com o [CLAUDE.md](../CLAUDE.md).

[^1]: **Next.js 15 + React 19 no lugar de Next.js 14 + React 18.** O PRD foi escrito quando a linha 14 era a atual. Hoje ela está fora do ciclo de suporte ativo, e `@supabase/ssr`, shadcn/ui e `@dnd-kit` têm melhor suporte na 15. O App Router — que é o que o PRD de fato exige — permanece idêntico. Decisão aprovada em 12/09/2026.

Fora isso, o escopo funcional deste documento é a fonte de verdade do produto: qualquer mudança de requisito deve ser refletida aqui antes de virar código.
