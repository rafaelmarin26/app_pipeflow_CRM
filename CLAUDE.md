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
  (auth)/                   # layout centrado, fundo em gradiente
    login/  signup/         #   Supabase Auth
    recuperar-senha/        #   pedido de link de redefinição
    callback/route.ts       #   troca do code por sessão
    convite/[token]/        #   aceite de convite
  (app)/                    # protegido por middleware
    (shell)/                #   rotas com sidebar + workspace switcher
      layout.tsx
      dashboard/            #     métricas, funil, prazos próximos
      leads/                #     listagem + busca/filtros
        [id]/               #       detalhe + timeline de atividades
      pipeline/             #     Kanban de negócios
      settings/
        workspace/  members/  billing/
    onboarding/             #   criar primeiro workspace — sem sidebar
  api/
    webhooks/stripe/route.ts #  assinatura verificada, idempotente
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
  views.ts                  # linhas com join (LeadWithOwner, ...) que as telas consomem
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
- **O grupo `(app)/(shell)/` carrega a sidebar**; o onboarding é irmão dele, não filho. A rota protegida que roda *antes* de existir workspace não pode herdar um layout cuja função é listar workspaces. O grupo não muda URL nenhuma, e a guarda do middleware continua valendo por caminho (`/onboarding` está sob `(app)`).

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
STRIPE_PRODUCT_PRO                 # prod_... do plano Pro — servidor apenas; o valor mensal vem de PRO_PRICE_CENTS
RESEND_API_KEY                     # Resend > API Keys
NEXT_PUBLIC_APP_URL                # http://localhost:3000 em dev
```

`.env.local` nunca é commitado. `.env.example` fica versionado com as chaves vazias.

---

## 7. Identidade visual

**Versão 2 — "Editorial Brutalist × Fintech".** Substitui integralmente a identidade indigo/Inter
da v1. A direção é deliberadamente editorial: contenção acima de espetáculo, dados como interface,
tipografia com opinião, grid modular, textura em vez de brilho.

### A aplicação é só escura

Não há tema claro nem alternador. O `<html>` carrega a classe `dark` de forma estática — mantida
apenas porque os componentes shadcn vendorizados trazem variantes `dark:` que precisam continuar
resolvendo. O produto tem um visual, e é este.

### Paleta

**Acento — uma cor só, com convicção.**

```css
--accent:       #CAFF33;  /* chartreuse ácido — CTAs, item ativo, marca, badge Pro */
--accent-ink:   #0C0C0E;  /* o que fica SOBRE o acento: quase-preto, nunca branco */
--accent-hover: #D9FF5C;
```

**Superfícies e texto.**

```css
--bg:            #0C0C0E;  /* fundo da página        */  --text:           #E8E8E8;
--surface:       #141416;  /* cards, sidebar, painéis */  --text-secondary: #8A8A8F;
--surface-2:     #1A1A1E;  /* hover, destaque        */  --text-muted:     #83838B;
--border:        #2A2A2E;  /* bordas visíveis        */
--border-subtle: #1E1E22;  /* divisores internos     */
```

> **Desvio medido do guia v2.** O guia define `text-muted` como `#555559`, que mede **2,48:1**
> sobre `--surface` — bem abaixo dos 4,5:1 de AA, e é justamente o token dos labels mono de
> 10–11px, o texto mais difícil da tela. Subiu para `#83838B` (4,8:1), o valor mais escuro que
> passa mantendo o terceiro degrau abaixo do secundário.

**Etapas do pipeline — uma cor por etapa.** Frio no topo do funil, esquentando até o fecho:

| Etapa (`deal_stage`) | Token | Hex |
|---|---|---|
| `new` — Novo Lead | `--stage-new` | `#5B7FFF` |
| `contacted` — Contato Realizado | `--stage-contacted` | `#00B4D8` |
| `proposal` — Proposta Enviada | `--stage-proposal` | `#CAFF33` |
| `negotiation` — Negociação | `--stage-negotiation` | `#FF6B35` |
| `won` — Fechado Ganho | `--stage-won` | `#2ED573` |
| `lost` — Fechado Perdido | `--stage-lost` | `#FF4757` |

Isso **substitui a regra da v1** de três tons, em que toda etapa aberta era indigo e só ganho e
perdido tinham cor própria. Os mapas de classe vivem em `lib/stage-styles.ts` — badge, cabeçalho
de coluna e card leem de lá, para que uma etapa laranja no board não seja âmbar no detalhe do lead.

**Semânticas, fora do funil:** `--positive #2ED573` · `--negative #FF4757` · `--warm #FF6B35`
(urgência) · `--cool #5B7FFF` (informativo).

**A regra que organiza o uso de cor:** **acento significa interação, cor de etapa significa
informação.** O chartreuse só aparece porque o usuário está apontando para algo — hover, foco,
item ativo, alvo de drop. A cor da etapa diz o que a coisa é. As duas nunca trocam de papel.

**Não há mais escala `-ink`.** Na v1 o tom cheio falhava AA sobre o próprio tinte e cada cor
precisava de um par. Nesta paleta as seis etapas e as semânticas passam AA como texto sobre
`--surface` **e** sobre um tinte de 10% de si mesmas, medidas. Os nomes `--won-ink`, `--open-ink`
etc. sobrevivem em `globals.css` apenas como aliases apontando para o próprio tom, para as telas
da v1 continuarem compilando enquanto migram.

### Dois vocabulários, uma paleta

Os componentes shadcn em `components/ui/` falam o vocabulário próprio deles. `app/globals.css`
mapeia esses nomes sobre os tokens acima em vez de editar 15 arquivos a cada atualização. Onde os
dois colidem, **o significado do shadcn prevalece**:

| Utilitário | Significado | Token |
|---|---|---|
| `bg-muted` | superfície de baixo contraste | `--surface-2` |
| `text-muted-foreground` | **texto secundário** | `--text-secondary` |
| `bg-accent` | superfície de hover | `--surface-2` |
| `bg-brand` / `text-brand` | **chartreuse da marca** | `--accent` |
| `text-faint` | texto terciário (labels, metadata) | `--text-muted` |
| `bg-elevated` | hover, card destacado | `--surface-2` |
| `border-hairline` | divisor interno | `--border-subtle` |
| `bg-primary` | botão primário | `--accent` |

### Tipografia

Três vozes, carregadas por `next/font/google`:

| Voz | Fonte | Uso |
|---|---|---|
| Display | **Syne** 600/700/800 | títulos, nome do produto, métricas grandes. Tracking negativo |
| Corpo | **DM Sans** | prosa, labels de UI, botões. `line-height: 1.65` |
| Dados | **IBM Plex Mono** 400/500/600 | dinheiro, labels, tags, metadata, timestamps |

Utilitários que codificam essas vozes, em `globals.css`:

- `money` — mono + `tabular-nums`. **Todo valor em R$ usa.** Colunas de dinheiro precisam alinhar.
- `label-mono` — mono 11px, `uppercase`, `letter-spacing: 0.15em`. A voz de label do produto:
  cabeçalho de coluna, cabeçalho de tabela, badge, metadata.
- `display-xl` / `display-lg` / `display-md` — Syne com o tracking negativo de cada patamar.

Escala: `text-3xl` + `display-lg` título de página · `text-lg` seção · `text-sm` corpo ·
`label-mono` metadados.

### Forma e espaço

- Raio: **nunca acima de 12px**. `rounded-lg` (8px) em painéis e colunas, `rounded-md` (6px) em
  cards e inputs, `rounded-sm` em chips. Badge não é pílula na v2 — é ponto colorido + label mono.
- Espaçamento em múltiplos de 4px. Padding de card `p-3`/`p-4`; de página `p-6`.
- Densidade de tabela: linhas de 44px, cabeçalho em `label-mono`, **sem zebra** (genérico demais),
  hover em `bg-elevated`.
- **Textura, não brilho.** Um grão de ruído SVG fixo a 3,5% de opacidade sobre a página inteira dá
  dente ao fundo quase-preto. É onde a v2 gasta o orçamento de efeito.

### Efeitos proibidos

Glassmorphism (`backdrop-filter: blur`), gradient text, partículas em canvas, neon glow e
`text-shadow`, órbitas flutuantes, raio acima de 12px, e mais de uma cor de acento competindo.
Se um elemento precisa de brilho para se destacar, ele está no lugar errado da hierarquia.

### Princípios de interface

1. **O Kanban é o herói.** É a tela que vende o produto; ganha o melhor espaço e o maior cuidado.
2. **Uma ação primária por tela.** Um único botão chartreuse preenchido; o resto é `ghost` ou
   `outline`.
3. **Estado vazio nunca é uma tela em branco.** Toda frase explica e oferece a primeira ação.
4. **Feedback imediato.** Arrastar um card atualiza a UI na hora e reverte com toast se o banco
   recusar.
5. **Contenção acima de espetáculo.** Um acento bem posicionado vale mais que dez efeitos.
6. **Anti-padrão HubSpot:** se uma tela precisa de tutorial, ela precisa de corte.

### Movimento

Uma entrada orquestrada por tela e nada mais: `fade + slideUp` de 16px com stagger incremental,
disparado por Intersection Observer ou por `animation-delay`. Barra de acento crescendo de 0 a
100% no hover de um card. **Nada em loop** — a aplicação é superfície de trabalho. Só `transform`
e `opacity`, e tudo desligado sob `prefers-reduced-motion`.

### Tom de voz

PT-BR direto e profissional, sem jargão corporativo e sem infantilização. "Nenhum negócio nesta
etapa ainda." — não "Ops! Parece que está tudo vazio por aqui 😅". Valores sempre como `R$ 1.250,00`.

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

Um milestone por vez: terminar, validar e mesclar na `main` por Pull Request antes de começar o próximo. M10 é o gargalo — nada da Fase 3 começa antes do schema com RLS provada.

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

npm run stripe:listen        # stripe listen --events <os 4 eventos tratados> --forward-to localhost:3000/api/webhooks/stripe
npx shadcn@latest add <component>
```

Fluxo de milestone — branch, PR e merge por rebase (histórico linear, sem commit de merge):

```bash
git switch -c feat/<slug> main
# ... trabalho e commits ...
git push -u origin feat/<slug>
gh pr create --base main --title "feat: ..." --body-file <arquivo>
gh pr merge --rebase --delete-branch
git switch main && git pull --ff-only
```

---

## 10. Ao trabalhar neste projeto

- Ler [docs/PRD.md](docs/PRD.md) antes de implementar qualquer funcionalidade nova — ele é a fonte de verdade do escopo.
- Mudou requisito? Atualizar o PRD **antes** de escrever o código.
- Mudou decisão técnica (versão, biblioteca, convenção)? Atualizar este arquivo na mesma leva.
- Skills disponíveis em `.claude/skills/` cobrem Supabase/Postgres, Stripe, frontend, backend e segurança — usar quando a tarefa encostar nesses temas.
- Trabalhar um milestone por vez, seguindo [docs/PLAN.md](docs/PLAN.md). Terminar, validar e marcar as entregas antes de começar o próximo.
