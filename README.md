# PipeFlow CRM

CRM de vendas para PMEs, freelancers e pequenos times. Multi-empresa, com pipeline Kanban,
gestão de leads com timeline de atividades, dashboard de métricas e plano gratuito de verdade.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase (Postgres, RLS, Auth) · Stripe · Resend

## Como rodar

Requer Node 24 e npm.

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm run dev                  # http://localhost:3000
```

Outros comandos:

```bash
npm run build   # valida tipos e gera o build de produção
npm run lint
```

## Documentação

- [CLAUDE.md](CLAUDE.md) — stack, convenções, estrutura e identidade visual
- [docs/PRD.md](docs/PRD.md) — escopo do produto
- [docs/PLAN.md](docs/PLAN.md) — roteiro de execução por milestone
