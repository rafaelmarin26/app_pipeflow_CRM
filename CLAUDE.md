# PipeFlow CRM — Briefing do Projeto

Documento de referência para toda sessão de desenvolvimento. Define stack, convenções, estrutura e identidade visual. **Escopo de produto vive em [docs/PRD.md](docs/PRD.md)** — este arquivo cuida do *como*, o PRD cuida do *o quê*.

---

## 1. Visão do produto

SaaS de CRM de vendas para PMEs, freelancers e pequenos times no Brasil. Multi-empresa (workspaces isolados), pipeline Kanban com drag-and-drop, gestão de leads com timeline de atividades, dashboard de métricas e monetização freemium via Stripe.

**Posicionamento:** a simplicidade do Pipedrive com um plano gratuito de verdade. Se uma tela começar a parecer o HubSpot, ela está errada.

**Personas:** Admin (dono do negócio, gerencia workspace/time/plano), Membro (vendedor, opera leads e negócios), Admin Solo (freelancer com um workspace por cliente).

---

## 2. Stack

Versões fixadas. Não trocar sem decisão explícita registrada aqui.

| Camada | Escolha | Observação |
|---|---|---|
| Framework | Next.js `^15` — App Router | React `^19`. **Não** usar Pages Router |
| Linguagem | TypeScript `^5` | `strict: true`. Sem `any` sem comentário justificando |
| Estilo | Tailwind CSS `^4` | Tokens como CSS variables (seção 7) |
| Componentes | shadcn/ui | Copiados para `components/ui/`, não é dependência npm |
| Banco + Auth | Supabase (Postgres + RLS + Auth) | `@supabase/ssr` para cookies |
| Pagamento | Stripe | Checkout + Webhook + Customer Portal |
| E-mail | Resend | Convites de colaborador |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` | Acessível por teclado, ao contrário de react-beautiful-dnd |
| Gráficos | Recharts | Funil e métricas do dashboard |
| Formulários | `react-hook-form` + `zod` | Mesmo schema zod valida client e Server Action |
| Datas | `date-fns` | Locale `ptBR` |
| Runtime / deploy | Node 24 · Vercel · npm | |

**Bibliotecas descontinuadas — nunca usar:** `@supabase/auth-helpers-nextjs` (substituída por `@supabase/ssr`), `react-beautiful-dnd` (sem manutenção).

---

## 3. Estrutura de pastas

```
app/
  (marketing)/              # público, sem auth
    page.tsx                #   landing: hero, features, pricing, CTA
  (auth)/
    login/  signup/         #   Supabase Auth
    callback/route.ts       #   troca do code por sessão
    convite/[token]/        #   aceite de convite
  (app)/                    # protegido por middleware
    layout.tsx              #   sidebar + workspace switcher
    dashboard/              #   métricas, funil, prazos próximos
    leads/                  #   listagem + busca/filtros
      [id]/                 #   detalhe + timeline de atividades
    pipeline/               #   Kanban de negócios
    settings/
      workspace/  members/  billing/
    onboarding/             #   criar primeiro workspace
  api/
    stripe/webhook/route.ts #   assinatura verificada, idempotente
components/
  ui/                       # shadcn — regenerar via CLI, não editar à mão
  leads/  pipeline/  dashboard/  layout/  marketing/
lib/
  supabase/                 # client.ts (browser) · server.ts (RSC/actions) · middleware.ts
  stripe/                   # client.ts · plans.ts (limites do Free)
  email/                    # resend.ts + templates
  validations/              # schemas zod por domínio
  labels.ts                 # enum em inglês -> rótulo PT-BR
  utils.ts                  # cn(), formatCurrency(), formatDate()
types/
  database.ts               # gerado: supabase gen types typescript
supabase/
  migrations/               # SQL versionado, timestamp no nome
docs/
  PRD.md                    # escopo do produto
  PLAN.md                   # roteiro de execução por milestone
middleware.ts               # refresh de sessão + guarda de rotas
```

### Regras de arquitetura

- **Server Components por padrão.** `"use client"` só em folhas que precisam de estado, evento ou browser API — nunca num `layout.tsx` ou `page.tsx` inteiro.
- **Mutações via Server Actions**, colocalizadas em `_actions.ts` dentro da rota que as usa. Route Handlers ficam reservados para webhooks e integrações externas.
- **Toda Server Action começa com:** autenticar → resolver workspace ativo → validar input com zod → checar permissão → executar. Nessa ordem, sem pular etapas.
- Busca de dados acontece no Server Component; o client recebe dados prontos via props.

---

## 4. Modelo de dados

Nomes em inglês, `snake_case`. Toda tabela de domínio carrega `workspace_id` — é a chave do isolamento multi-empresa.

| Tabela | Colunas principais |
|---|---|
| `workspaces` | `id`, `name`, `slug`, `owner_id`, `plan`, `created_at` |
| `workspace_members` | `workspace_id`, `user_id`, `role`, `created_at` — PK composta |
| `invites` | `id`, `workspace_id`, `email`, `role`, `token`, `expires_at`, `accepted_at` |
| `leads` | `id`, `workspace_id`, `name`, `email`, `phone`, `company`, `job_title`, `status`, `owner_id`, `created_at` |
| `deals` | `id`, `workspace_id`, `lead_id`, `title`, `value_cents`, `stage`, `position`, `owner_id`, `due_date`, `closed_at` |
| `activities` | `id`, `workspace_id`, `lead_id`, `deal_id`, `author_id`, `type`, `description`, `occurred_at` |
| `subscriptions` | `workspace_id`, `stripe_customer_id`, `stripe_subscription_id`, `status`, `current_period_end` |

### Enums

```
member_role    admin | member
plan           free | pro
lead_status    new | contacted | qualified | unqualified | customer
activity_type  call | email | meeting | note
deal_stage     new | contacted | proposal | negotiation | won | lost
```

O `deal_stage` mapeia 1:1 as colunas do Kanban do PRD:

| Enum | Coluna na UI |
|---|---|
| `new` | Novo Lead |
| `contacted` | Contato Realizado |
| `proposal` | Proposta Enviada |
| `negotiation` | Negociação |
| `won` | Fechado Ganho |
| `lost` | Fechado Perdido |

**Rótulos PT-BR vivem em `lib/labels.ts`, nunca no banco.** Trocar um texto de UI não deve exigir migration.

### Convenções de schema

- Dinheiro em **centavos, `bigint`** (`value_cents`). Nunca `float` para valor — arredondamento silencioso quebra relatório de pipeline.
- Timestamps sempre `timestamptz`, nunca `timestamp`.
- Ordenação do Kanban via coluna `position` (`numeric`), permitindo inserir entre dois cards sem reescrever a coluna inteira.
- Toda FK indexada. Postgres não cria esse índice sozinho.

---

## 5. Regras invioláveis

### Segurança de dados (RLS)

- **Sempre** `alter table ... enable row level security` na mesma migration que cria a tabela. Tabela sem RLS no Supabase é tabela pública.
- Policies filtram por `workspace_id` através de uma função `security definer`:

  ```sql
  create function public.is_workspace_member(ws uuid)
  returns boolean language sql security definer stable
  set search_path = '' as $$
    select exists (
      select 1 from public.workspace_members
      where workspace_id = ws and user_id = (select auth.uid())
    );
  $$;
  ```

  Consultar `workspace_members` direto dentro da policy dessa mesma tabela causa recursão infinita — daí a função.
- **Sempre** envolver `auth.uid()` em `(select auth.uid())` dentro de policies. Sem o subselect, o Postgres reavalia a função linha a linha e a query degrada em escala.
- **Sempre** indexar colunas usadas em policy (`workspace_id`, `user_id`).
- Ações restritas a Admin (convidar, remover membro, alterar plano, excluir workspace) são checadas **no servidor**, além de escondidas na UI.

### Segredos

- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e `RESEND_API_KEY` **nunca** aparecem em Client Component nem em variável `NEXT_PUBLIC_*`.
- Service role key só em Route Handler ou Server Action, e só quando RLS precisa mesmo ser contornado (ex.: aceitar convite antes de o usuário ser membro).

### Autenticação

- No servidor, autorização usa `getUser()` ou `getClaims()`. **Nunca** `getSession()` — ele lê o cookie sem revalidar e é forjável.
- O `middleware.ts` faz refresh de sessão e protege `(app)/*`; ele complementa a RLS, não substitui.

### Stripe

- **Sempre** verificar a assinatura com `stripe.webhooks.constructEvent` antes de processar o evento.
- Webhook é **idempotente**: guardar `event.id` processado e ignorar repetição. O Stripe reenvia.
- O estado do plano vem da tabela `subscriptions`, alimentada pelo webhook — nunca de um retorno de checkout no client.
- Limites do Free (**2 colaboradores, 50 leads**) checados no servidor, dentro da Server Action, antes de inserir.

---

## 6. Convenções de código

- **Idioma:** documentação, UI e mensagens ao usuário em **PT-BR**. Código, nomes de tabela/coluna, tipos, rotas, comentários e commits em **inglês**.
- **Arquivos:** `kebab-case.tsx`. **Componentes:** `PascalCase`. **Funções e variáveis:** `camelCase`. **Banco:** `snake_case`.
- **Commits:** Conventional Commits em inglês — `feat: add kanban drag persistence`, `fix: prevent duplicate stripe webhook`.
- Erros de Server Action retornam `{ error: string }` com mensagem em PT-BR pronta para exibição; nunca vazam stack trace nem mensagem crua do Postgres.
- Nada de `console.log` em código commitado.
- Após alterar o schema: `supabase gen types typescript --local > types/database.ts`.

### Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL           # Supabase > Project Settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY      # idem
SUPABASE_SERVICE_ROLE_KEY          # idem — servidor apenas
STRIPE_SECRET_KEY                  # Stripe > Developers > API keys
STRIPE_WEBHOOK_SECRET              # Stripe CLI ou endpoint do dashboard
NEXT_PUBLIC_STRIPE_PRICE_PRO       # price_... do plano Pro
RESEND_API_KEY                     # Resend > API Keys
NEXT_PUBLIC_APP_URL                # http://localhost:3000 em dev
```

`.env.local` nunca é commitado. `.env.example` fica versionado com as chaves vazias.

---

## 7. Identidade visual

### Paleta

```css
--primary:       #4F46E5;  /* indigo-600 — ações, links, marca */
--primary-hover: #4338CA;
--accent:        #8B5CF6;  /* violet-500 — gradiente da landing, destaques */

--bg:      #FFFFFF;  --bg-dark:      #0B1120;
--surface: #F8FAFC;  --surface-dark: #111827;
--border:  #E2E8F0;  --border-dark:  #1E293B;
--text:    #0F172A;  --text-dark:    #F1F5F9;
--muted:   #64748B;
```

**Cores semânticas do funil** — usadas em badges, colunas do Kanban e barras do gráfico:

| Significado | Cor |
|---|---|
| Fechado Ganho | `#16A34A` |
| Fechado Perdido | `#DC2626` |
| Negócio aberto | `#4F46E5` |
| Prazo próximo / atenção | `#F59E0B` |

Verde e vermelho são **exclusivos** de ganho/perdido. Não usar como cor decorativa em outro lugar — no Kanban, cor é informação. A única exceção é `--lost`, reaproveitado como cor de ação destrutiva (`variant="destructive"`), onde o vermelho é convenção de interface e não classificação de funil.

### Dois vocabulários, uma paleta

Os componentes shadcn vendorizados em `components/ui/` falam o vocabulário próprio deles (`bg-background`, `bg-muted`, `bg-accent`). Em vez de editar 15 arquivos a cada atualização, `app/globals.css` mapeia esses nomes sobre os tokens acima. Dois nomes colidem, e nesses **o significado do shadcn prevalece**, porque os componentes dependem dele:

| Utilitário | Significado | Token do CLAUDE.md |
|---|---|---|
| `bg-muted` | superfície de baixo contraste | `--subtle` |
| `text-muted-foreground` | **texto apagado** | `--muted` (#64748B) |
| `bg-accent` | superfície de hover | `--subtle` |
| `bg-brand` / `text-brand` | **violeta da marca** | `--accent` (#8B5CF6) |

As variáveis CSS mantêm os nomes e os hexes desta seção; só os utilitários Tailwind mudam de nome. Na prática: texto secundário é `text-muted-foreground`, e o violeta da marca é `bg-brand`.

Além disso, `--canvas` e `--panel` nomeiam o **papel** em vez do tom, porque as duas superfícies trocam de posição entre os temas: no claro a página é a tonalizada (`--surface`) e os painéis são brancos (`--bg`); no escuro a página é a camada mais baixa (`--bg`) e os painéis ficam acima (`--surface`).

### Tipografia

- **Inter**, carregada via `next/font/google` (`subsets: ['latin']`, `display: 'swap'`).
- Números de valor monetário com `font-variant-numeric: tabular-nums` — colunas de R$ precisam alinhar.
- Escala: `text-3xl/bold` título de página · `text-lg/semibold` seção · `text-sm` corpo da aplicação · `text-xs` metadados e timestamps.
- A landing pode subir a escala (`text-5xl`+); a aplicação permanece densa e sóbria.

### Forma e espaço

- Raio: `0.5rem` (`rounded-lg`) em cards e inputs; `9999px` em badges.
- Sombras discretas: `shadow-sm` em repouso, `shadow-md` em card arrastado. Nada de sombra pesada.
- Espaçamento em múltiplos de 4px. Padding de card: `p-4`; da página: `p-6`.
- Densidade de tabela: linhas de 44px, cabeçalho `text-xs uppercase tracking-wide text-muted-foreground`.
- Dark mode via classe `dark` no `<html>`, com os tokens acima — nunca hardcode de hex no componente.
- **O tema escuro é o padrão.** O servidor já renderiza `<html class="dark">`; um script inline remove a classe antes da primeira pintura quando o visitante escolheu claro explicitamente. A preferência do sistema operacional não é consultada — o produto tem um visual padrão e o usuário pode trocar.

### Princípios de interface

1. **O Kanban é o herói.** É a tela que vende o produto; ganha o melhor espaço, a melhor animação e o maior cuidado.
2. **Uma ação primária por tela.** Um único botão indigo preenchido; o resto é `ghost` ou `outline`.
3. **Estado vazio nunca é uma tela em branco.** Todo empty state traz uma frase explicando e um botão para a primeira ação.
4. **Feedback imediato.** Arrastar um card atualiza a UI na hora (otimista) e reverte com toast se o banco recusar.
5. **Anti-padrão HubSpot:** se uma tela precisa de tutorial, ela precisa de corte.

### Tom de voz

PT-BR direto e profissional, sem jargão corporativo e sem infantilização. "Nenhum negócio nesta etapa ainda." — não "Ops! Parece que está tudo vazio por aqui 😅". Valores sempre formatados como `R$ 1.250,00`.

---

## 8. Milestones

O roteiro de execução vive em **[docs/PLAN.md](docs/PLAN.md)** — 17 milestones, cada um com objetivo, entregas em checkbox, critério de validação e commit final. É o documento a consultar antes de começar qualquer etapa, e a fonte de verdade do sequenciamento.

**Ordem de construção: interface primeiro, backend depois.** As telas são montadas com dados falsos antes de existir qualquer linha de Supabase, para validar fluxos enquanto mudar ainda é barato. Os mocks têm exatamente o formato do banco — mesmos nomes de campo, mesmos enums — e componentes recebem dados via props, nunca importando o mock. Assim, trocar mock por query real é uma alteração pontual, não uma refatoração.

| Fase | Milestones | Entrega |
|---|---|---|
| 0 — Fundação | M1–M2 | Scaffold, tokens, design system, mocks tipados |
| 1 — Interface pública e shell | M3–M5 | Landing, shell da aplicação, telas de acesso |
| 2 — Interface do produto | M6–M9 | Leads, Kanban, Dashboard e Settings com mocks |
| 3 — Backend | M10–M16 | Schema e RLS, auth, persistência, colaboração, Stripe |
| 4 — Entrega | M17 | Polimento, hardening e produção |

Um milestone por vez: terminar, validar e commitar na `main` antes de começar o próximo. M10 é o gargalo — nada da Fase 3 começa antes do schema com RLS provada.

---

## 9. Comandos

```bash
npm run dev                  # desenvolvimento
npm run build                # valida tipos e build de produção
npm run lint

npx supabase start           # stack local
npx supabase migration new <name>
npx supabase db reset        # reaplica migrations + seed
npx supabase gen types typescript --local > types/database.ts

stripe listen --forward-to localhost:3000/api/stripe/webhook
npx shadcn@latest add <component>
```

---

## 10. Ao trabalhar neste projeto

- Ler [docs/PRD.md](docs/PRD.md) antes de implementar qualquer funcionalidade nova — ele é a fonte de verdade do escopo.
- Mudou requisito? Atualizar o PRD **antes** de escrever o código.
- Mudou decisão técnica (versão, biblioteca, convenção)? Atualizar este arquivo na mesma leva.
- Skills disponíveis em `.claude/skills/` cobrem Supabase/Postgres, Stripe, frontend, backend e segurança — usar quando a tarefa encostar nesses temas.
- Trabalhar um milestone por vez, seguindo [docs/PLAN.md](docs/PLAN.md). Terminar, validar e marcar as entregas antes de começar o próximo.
