# PipeFlow CRM — Plano de Execução

Roteiro de build do setup ao deploy. Cada milestone é um incremento entregável, com branch própria, entregas verificáveis e um commit final.

**Fontes:** escopo em [PRD.md](PRD.md) · stack, convenções e identidade visual em [../CLAUDE.md](../CLAUDE.md).

---

## Como usar este plano

- **Um milestone por vez.** Terminar, validar e commitar antes de abrir a próxima branch.
- **Branches** a partir de `main`, merge de volta ao concluir. Padrão: `chore/*` para infraestrutura, `feat/*` para funcionalidade.
- **Commits** em inglês, Conventional Commits. O commit final listado é o que fecha o milestone — commits intermediários são livres.
- **Checkboxes** marcados apenas quando a entrega está funcionando, não quando o arquivo existe.
- **Validação** de cada milestone é o teste manual mínimo antes de avançar.

### Estratégia: interface primeiro, backend depois

As fases 1 e 2 constroem **toda a interface com dados falsos** antes de qualquer linha de Supabase. Isso permite validar telas, fluxos e a linguagem visual enquanto ainda é barato mudar — um ajuste de layout custa minutos; um ajuste de schema depois de 6 telas acopladas custa uma tarde.

Para que a UI não vire trabalho jogado fora, a regra é:

> **Os mocks têm exatamente o formato do banco.** `lib/mock-data.ts` exporta fixtures tipadas com a mesma forma que `types/database.ts` terá — mesmos nomes de campo (`value_cents`, `stage`, `workspace_id`), mesmos enums. Trocar mock por query real vira uma linha por página, não uma refatoração.

Componentes recebem dados **via props**, nunca importam o mock diretamente. Só o Server Component da página conhece a origem dos dados.

> **Nota:** esta ordenação substitui a tabela de milestones da seção 8 do CLAUDE.md, que listava o schema como etapa 2. Em caso de conflito, **este documento prevalece**.

---

## Visão geral

| Fase | Milestones | Entrega |
|---|---|---|
| 0 — Fundação | M1–M2 | Projeto de pé, design system e tokens |
| 1 — Interface pública e shell | M3–M5 | Landing, layout da aplicação, telas de acesso |
| 2 — Interface do produto | M6–M9 | Leads, Kanban, Dashboard e Settings com mocks |
| 3 — Backend | M10–M16 | Banco, auth, persistência, colaboração e cobrança |
| 4 — Entrega | M17 | Polimento, hardening e produção |

---

# FASE 0 — Fundação

## M1 · Setup do projeto

**Branch:** `chore/project-setup`

**Objetivo:** deixar o projeto de pé com a stack fixada no CLAUDE.md, tokens visuais aplicados e a estrutura de pastas criada — nenhuma tela ainda.

### Entregas

- [ ] `git init` e primeiro commit; `.gitignore` cobrindo `.env*.local`, `node_modules`, `.next`
- [ ] Scaffold Next.js 15 com App Router, TypeScript `strict`, ESLint e alias `@/*`
- [ ] Tailwind CSS 4 configurado
- [ ] Tokens da paleta indigo como CSS variables em `app/globals.css`, nas duas variantes (claro e escuro)
- [ ] Cores semânticas do funil registradas como tokens (`--won`, `--lost`, `--open`, `--due`)
- [ ] Fonte Inter via `next/font/google`, com `tabular-nums` utilitário para valores monetários
- [ ] Dark mode por classe, com toggle funcionando
- [ ] Estrutura de pastas do CLAUDE.md §3 criada (route groups vazios, `lib/`, `types/`, `components/`)
- [ ] `.env.example` versionado com as 8 chaves da seção 6, todas vazias
- [ ] `README.md` curto: o que é, como rodar, link para PRD e CLAUDE.md

### Validação

`npm run dev` sobe sem erro · `npm run build` passa · alternar o tema troca as cores da página.

**Commit final:** `chore: scaffold next 15 project with tailwind and design tokens`

---

## M2 · Design system

**Branch:** `feat/design-system`

**Objetivo:** ter o vocabulário visual pronto — componentes shadcn instalados, helpers de formatação, rótulos PT-BR e os fixtures que alimentam toda a Fase 1 e 2.

### Entregas

- [ ] shadcn/ui inicializado, apontando para os tokens do M1 (não para a paleta padrão)
- [ ] Componentes base instalados: `button`, `input`, `label`, `select`, `dialog`, `dropdown-menu`, `table`, `badge`, `card`, `avatar`, `tabs`, `sonner`, `skeleton`, `separator`, `sheet`
- [ ] `lib/utils.ts` — `cn()`, `formatCurrency()` (R$ com centavos), `formatDate()` e `formatRelativeDate()` com locale `ptBR`
- [ ] `lib/labels.ts` — mapa de todos os enums para rótulos PT-BR (`deal_stage`, `lead_status`, `activity_type`, `member_role`, `plan`)
- [ ] `types/database.ts` escrito **à mão** por ora, espelhando o modelo de dados do CLAUDE.md §4 — será substituído pelo gerado no M10
- [ ] `lib/mock-data.ts` — fixtures tipadas: 1 workspace, 3 membros, ~20 leads, ~15 deals distribuídos nas 6 etapas, ~30 atividades
- [ ] `components/shared/stage-badge.tsx` e `status-badge.tsx` — cor semântica derivada do enum
- [ ] `components/shared/empty-state.tsx` — ícone, frase PT-BR e slot de ação
- [ ] `components/shared/page-header.tsx` — título, descrição e slot de ação primária única

### Validação

Uma página de teste renderiza todos os badges com as cores corretas, um empty state e valores formatados como `R$ 1.250,00`.

**Commit final:** `feat: add design system primitives, labels and typed mock data`

---

# FASE 1 — Interface pública e shell

## M3 · Landing page

**Branch:** `feat/landing-page`

**Objetivo:** entregar a página pública completa — é a primeira coisa demonstrável e não depende de nada.

### Entregas

- [ ] Rota `app/(marketing)/page.tsx` com layout próprio (header público + footer)
- [ ] **Hero:** headline, subheadline, CTA primário e prova visual do Kanban
- [ ] **Funcionalidades:** grid com os 5 pilares — Kanban, leads, atividades, dashboard, multi-empresa
- [ ] **Planos:** dois cards — Free (2 colaboradores, 50 leads) e Pro (R$ 49/mês, ilimitado), com destaque no Pro
- [ ] **CTA final** e footer com links
- [ ] Header com navegação âncora e botões Entrar / Criar conta
- [ ] Responsivo de 360px a desktop
- [ ] Metadata: title, description e Open Graph

### Validação

Percorrer a página em mobile e desktop sem quebra de layout; todos os CTAs apontam para `/signup`.

**Commit final:** `feat: add public landing page`

---

## M4 · Shell da aplicação

**Branch:** `feat/app-shell`

**Objetivo:** o esqueleto de toda a área autenticada — sidebar, troca de workspace e navegação. Sem auth real ainda.

### Entregas

- [ ] `app/(app)/layout.tsx` — grid sidebar + conteúdo, com scroll independente
- [ ] Sidebar: logo, navegação (Dashboard, Leads, Pipeline, Configurações) com estado ativo
- [ ] Workspace switcher no topo da sidebar — dropdown listando os workspaces do mock
- [ ] Menu do usuário no rodapé da sidebar: avatar, nome, tema, sair
- [ ] Drawer mobile (`sheet`) substituindo a sidebar abaixo de `md`
- [ ] Páginas placeholder das 4 rotas, cada uma com `PageHeader`
- [ ] `loading.tsx` com skeleton e `error.tsx` em `(app)`
- [ ] `not-found.tsx` da aplicação

### Validação

Navegar entre as 4 rotas mantendo a sidebar montada; item ativo correto; drawer abre e fecha no mobile.

**Commit final:** `feat: add authenticated app shell with sidebar and workspace switcher`

---

## M5 · Telas de acesso e onboarding

**Branch:** `feat/auth-screens`

**Objetivo:** todas as telas do fluxo de entrada, visualmente completas e com validação de formulário — sem chamar o Supabase.

### Entregas

- [ ] `login` — e-mail e senha, link de recuperação, link para signup
- [ ] `signup` — nome, e-mail e senha, com regra de senha visível
- [ ] Validação client com `react-hook-form` + `zod` (schemas em `lib/validations/auth.ts`)
- [ ] Estados de erro por campo e estado de carregamento no botão
- [ ] `onboarding` — passo único: nomear o primeiro workspace, com slug derivado automaticamente
- [ ] `convite/[token]` — tela de aceite: nome do workspace, quem convidou, papel oferecido
- [ ] Layout `(auth)` centrado, com a marca e fundo em gradiente indigo→violeta

### Validação

Submeter cada formulário vazio e ver as mensagens de erro em PT-BR; fluxo signup → onboarding navega corretamente.

**Commit final:** `feat: add auth and onboarding screens with client validation`

---

# FASE 2 — Interface do produto

## M6 · Interface de leads

**Branch:** `feat/leads-ui`

**Objetivo:** listagem, busca, filtros, cadastro e página de detalhe com timeline — tudo lendo de `mock-data.ts`.

### Entregas

- [ ] Tabela de leads: nome, empresa, cargo, status, responsável, criado em
- [ ] Busca por texto (nome, e-mail, empresa) com debounce, refletida na URL (`?q=`)
- [ ] Filtros por status, responsável e período, também na URL
- [ ] Estado vazio distinguindo "nenhum lead ainda" de "nenhum resultado para este filtro"
- [ ] Dialog de novo lead com os 6 campos do PRD e validação zod
- [ ] Edição pelo mesmo dialog, em modo de edição
- [ ] `leads/[id]` — cabeçalho com dados de contato, ações e badge de status
- [ ] Timeline de atividades: ícone por tipo, autor, descrição e data relativa, em ordem cronológica
- [ ] Formulário de nova atividade com seletor dos 4 tipos
- [ ] Negócios vinculados ao lead, listados no detalhe

### Validação

Buscar, filtrar, limpar filtros e recarregar a página mantendo o estado pela URL; abrir um lead e ver a timeline ordenada.

**Commit final:** `feat: add leads list, filters and detail view with activity timeline`

---

## M7 · Pipeline Kanban

**Branch:** `feat/pipeline-ui`

**Objetivo:** a tela herói do produto. Drag-and-drop fluido com estado local — a persistência entra no M13.

### Entregas

- [ ] Board com as 6 colunas do PRD, na ordem do enum `deal_stage`
- [ ] Cabeçalho de coluna: rótulo PT-BR, contagem e soma em R$
- [ ] Card de negócio: título, valor, lead vinculado, avatar do responsável e prazo
- [ ] Prazo vencido ou próximo destacado com o token `--due`
- [ ] Drag-and-drop com `@dnd-kit` entre colunas e reordenação dentro da coluna
- [ ] `DragOverlay` com `shadow-md` e leve rotação durante o arraste
- [ ] Navegação por teclado funcionando (requisito do `@dnd-kit`)
- [ ] Scroll horizontal do board com colunas de largura fixa
- [ ] Dialog de novo negócio: título, valor, lead, responsável, prazo e etapa
- [ ] Coluna vazia com estado vazio discreto, ainda aceitando drop
- [ ] Colunas Ganho e Perdido visualmente distintas das etapas abertas

### Validação

Arrastar um card entre todas as colunas; mover com teclado; totais por coluna recalculam na hora.

**Commit final:** `feat: add kanban pipeline board with dnd-kit`

---

## M8 · Dashboard

**Branch:** `feat/dashboard-ui`

**Objetivo:** as métricas e o gráfico de funil, calculados sobre os mocks.

### Entregas

- [ ] 4 cards de métrica: total de leads, negócios abertos, valor total do pipeline, taxa de conversão
- [ ] Gráfico de funil em Recharts, com as 6 etapas e as cores semânticas
- [ ] Tooltip do gráfico com contagem e valor formatado
- [ ] Lista "Seus negócios com prazo próximo" — do usuário logado, ordenada por prazo
- [ ] Cálculo das métricas isolado em `lib/metrics.ts`, recebendo arrays e devolvendo números — pronto para reuso com dados reais
- [ ] Skeletons de carregamento para cards e gráfico
- [ ] Estado vazio do dashboard para workspace recém-criado

### Validação

Conferir os 4 números à mão contra o mock; gráfico responsivo sem estourar o container.

**Commit final:** `feat: add dashboard with metrics cards and sales funnel chart`

---

## M9 · Configurações

**Branch:** `feat/settings-ui`

**Objetivo:** as três abas de configuração, incluindo a tela de plano — ainda sem Stripe.

### Entregas

- [ ] Layout de settings com abas: Workspace, Membros, Plano
- [ ] **Workspace:** nome, slug e zona de perigo (excluir), visível apenas para Admin
- [ ] **Membros:** tabela com avatar, nome, e-mail, papel e data de entrada
- [ ] Dialog de convite: e-mail e seleção de papel
- [ ] Convites pendentes listados com opção de reenviar e cancelar
- [ ] Ações de Admin escondidas quando o mock simula papel Membro
- [ ] **Plano:** card do plano atual, uso (`X de 50 leads`, `Y de 2 colaboradores`) com barra de progresso
- [ ] Comparativo Free × Pro e botão de upgrade (inerte por ora)
- [ ] Aviso de limite atingido, com o tom de voz do CLAUDE.md §7

### Validação

Alternar o papel no mock e confirmar que a UI de Admin desaparece; barras de uso refletem os números do mock.

**Commit final:** `feat: add workspace, members and billing settings screens`

---

# FASE 3 — Backend

> A partir daqui, cada milestone troca mocks por dados reais. A meta é que **nenhum componente de UI precise mudar** — só a origem dos dados no Server Component da página.

## M10 · Banco de dados e RLS

**Branch:** `feat/database-schema`

**Objetivo:** o schema completo com isolamento multi-empresa provado. É a fundação de todo o resto — nenhum atalho aqui.

### Entregas

- [ ] Supabase local rodando (`npx supabase start`), projeto remoto criado
- [ ] Migration dos 5 enums do CLAUDE.md §4
- [ ] Migration das 7 tabelas, com `timestamptz`, `value_cents bigint` e `position numeric`
- [ ] Índices em toda FK e em `workspace_id` / `user_id`
- [ ] Função `is_workspace_member(uuid)` como `security definer` com `search_path` vazio
- [ ] RLS habilitada em **todas** as 7 tabelas, na mesma migration que as cria
- [ ] Policies de select/insert/update/delete por tabela, com `auth.uid()` dentro de subselect
- [ ] Policies de Admin para `workspace_members`, `invites` e `workspaces`
- [ ] Trigger que cria o workspace e o vínculo de Admin no signup
- [ ] Seed com dois workspaces distintos para teste de isolamento
- [ ] `types/database.ts` regenerado a partir do banco, substituindo o escrito à mão no M2
- [ ] `lib/supabase/client.ts`, `server.ts` e `middleware.ts` com `@supabase/ssr`

### Validação

Autenticado como membro do workspace A, consultar dados do workspace B retorna **zero linhas** — testado via SQL e via client. `types/database.ts` compila sem quebrar nenhuma tela da Fase 2.

**Commit final:** `feat: add database schema with enums, indexes and rls policies`

---

## M11 · Autenticação real

**Branch:** `feat/auth-backend`

**Objetivo:** ligar as telas do M5 ao Supabase Auth e proteger a área autenticada.

### Entregas

- [ ] Server Actions de signup, login e logout
- [ ] `app/(auth)/callback/route.ts` trocando o code pela sessão
- [ ] `middleware.ts` com refresh de sessão e guarda das rotas autenticadas
- [ ] Autorização no servidor via `getUser()` — `getSession()` não aparece em lugar nenhum
- [ ] Redirecionamento pós-login para o último workspace; sem workspace, para o onboarding
- [ ] Onboarding criando workspace + vínculo de Admin de verdade
- [ ] Workspace ativo resolvido no servidor e propagado pelo layout
- [ ] Erros do Supabase traduzidos para PT-BR (credenciais inválidas, e-mail já cadastrado)
- [ ] Recuperação de senha ponta a ponta

### Validação

Criar conta nova → onboarding → dashboard. Acessar `/dashboard` deslogado redireciona para `/login`. Sessão sobrevive a um reload.

**Commit final:** `feat: wire supabase auth with session middleware and route protection`

---

## M12 · Leads e atividades persistidos

**Branch:** `feat/leads-backend`

**Objetivo:** substituir o mock de leads por Server Actions e queries reais.

### Entregas

- [ ] Schemas zod em `lib/validations/lead.ts` e `activity.ts`, compartilhados entre client e servidor
- [ ] Server Actions de criar, editar e excluir lead, seguindo a ordem obrigatória do CLAUDE.md §3
- [ ] Listagem como Server Component, com busca e filtros traduzidos em query Postgres
- [ ] Paginação ou scroll infinito na tabela
- [ ] Detalhe do lead buscando lead, atividades e negócios em paralelo
- [ ] Server Action de registrar atividade, com `author_id` do usuário autenticado
- [ ] `revalidatePath` nas rotas afetadas após cada mutação
- [ ] Erros retornados em PT-BR, sem vazar mensagem do Postgres
- [ ] Toast de sucesso e de falha em cada mutação

### Validação

Criar lead em duas contas de workspaces diferentes e confirmar isolamento. Buscar por termo que existe só em um lead. Registrar atividade e ver a timeline atualizar sem reload manual.

**Commit final:** `feat: replace lead mocks with server actions and postgres queries`

---

## M13 · Pipeline persistido

**Branch:** `feat/pipeline-backend`

**Objetivo:** o drag-and-drop do M7 gravando no banco, com atualização otimista.

### Entregas

- [ ] Server Actions de criar, editar e excluir negócio
- [ ] Action de mover negócio: grava `stage` e recalcula `position` entre os vizinhos
- [ ] Atualização otimista no cliente, com rollback e toast de erro se a action falhar
- [ ] `closed_at` preenchido ao entrar em `won` ou `lost`, limpo ao sair
- [ ] Totais por coluna calculados no servidor
- [ ] Board carregando negócios do workspace ativo com o lead e o responsável via join
- [ ] Dois arrastes rápidos em sequência não embaralham a ordem

### Validação

Arrastar um card, recarregar a página e ver o card na nova etapa. Simular falha da action com a rede offline e confirmar que o card volta para a coluna original com toast.

**Commit final:** `feat: persist kanban stage and position with optimistic updates`

---

## M14 · Dashboard com dados reais

**Branch:** `feat/dashboard-backend`

**Objetivo:** as métricas do M8 calculadas sobre o banco.

### Entregas

- [ ] Queries agregadas por workspace para os 4 cards
- [ ] Dados do funil agrupados por `deal_stage`, respeitando a ordem do enum
- [ ] Taxa de conversão como ganhos sobre ganhos mais perdidos, com tratamento de divisão por zero
- [ ] Prazos próximos filtrados por `owner_id` do usuário autenticado
- [ ] `lib/metrics.ts` do M8 reutilizado — a lógica de cálculo não é reescrita
- [ ] Agregações pesadas resolvidas em SQL, não em JavaScript sobre todas as linhas
- [ ] Suspense com os skeletons do M8 enquanto as queries resolvem

### Validação

Conferir os 4 números contra consultas SQL diretas. Criar um negócio novo e ver o funil mudar.

**Commit final:** `feat: compute dashboard metrics from database aggregates`

---

## M15 · Multi-empresa e colaboração

**Branch:** `feat/collaboration`

**Objetivo:** convites por e-mail, papéis aplicados no servidor e troca real de workspace.

### Entregas

- [ ] Resend configurado em `lib/email/resend.ts`
- [ ] Template de convite em PT-BR, com a identidade visual do produto
- [ ] Server Action de convidar: gera token, grava `invites` e dispara o e-mail
- [ ] Aceite do convite cria o vínculo e consome o token, com expiração e reuso tratados
- [ ] Reenviar e cancelar convite pendente
- [ ] Remover membro e alterar papel, restritos a Admin **no servidor**
- [ ] Último Admin não pode se rebaixar nem sair do workspace
- [ ] Workspace switcher trocando de contexto de verdade, com a escolha persistida
- [ ] Criar workspace adicional a partir do switcher
- [ ] Papel do usuário propagado pelo layout e usado para esconder ações de Admin

### Validação

Convidar um segundo e-mail, aceitar em outra sessão e confirmar o papel correto. Como Membro, chamar a action de remover membro direto e receber negativa do servidor.

**Commit final:** `feat: add email invites, member roles and workspace switching`

---

## M16 · Cobrança com Stripe

**Branch:** `feat/stripe-billing`

**Objetivo:** monetização ponta a ponta, com os limites do Free aplicados no servidor.

### Entregas

- [ ] Produto e preço Pro de R$ 49/mês criados no Stripe
- [ ] `lib/stripe/plans.ts` com os limites do Free — fonte única de verdade
- [ ] Server Action criando a sessão de Stripe Checkout, com `workspace_id` nos metadados
- [ ] Route Handler do webhook com `constructEvent` validando a assinatura
- [ ] Webhook idempotente: `event.id` registrado e repetição ignorada
- [ ] Eventos tratados: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Tabela `subscriptions` como única fonte do estado do plano
- [ ] Customer Portal para gerenciar e cancelar assinatura
- [ ] Limite de 50 leads checado na Server Action de criar lead
- [ ] Limite de 2 colaboradores checado na Server Action de convidar
- [ ] Mensagem de limite com caminho claro para o upgrade
- [ ] Downgrade preserva os dados existentes, apenas bloqueia novos inserts

### Validação

Checkout com o cartão de teste 4242 4242 4242 4242 libera o Pro. Reenviar o mesmo evento pelo Stripe CLI não duplica nada. No Free com 50 leads, o 51º é recusado pelo servidor.

**Commit final:** `feat: add stripe checkout, webhook handling and plan limits`

---

# FASE 4 — Entrega

## M17 · Hardening e deploy

**Branch:** `chore/production-release`

**Objetivo:** fechar as pontas e colocar em produção.

### Entregas — polimento

- [ ] `loading.tsx` e `error.tsx` em todas as rotas autenticadas
- [ ] Toda mutação com estado de carregamento e feedback visível
- [ ] Acessibilidade: foco visível, navegação por teclado no Kanban, labels em todos os inputs, contraste AA
- [ ] Responsividade revisada em 360px, 768px e 1440px
- [ ] Textos revisados contra o tom de voz do CLAUDE.md §7 — sem infantilização
- [ ] Nenhum log de depuração no código; `npm run lint` e `npm run build` limpos
- [ ] Metadata e Open Graph na landing; `robots.txt` bloqueando a área autenticada

### Entregas — segurança

- [ ] Auditoria de RLS: cada tabela testada com usuário de outro workspace
- [ ] Nenhuma chave secreta exposta em variável pública — verificado por busca no bundle
- [ ] `getSession()` ausente de qualquer caminho de autorização
- [ ] Rate limit no envio de convites

### Entregas — produção

- [ ] Migrations aplicadas no projeto Supabase de produção
- [ ] Projeto na Vercel com as 8 variáveis de ambiente configuradas
- [ ] Stripe em modo live, com endpoint de webhook apontando para o domínio de produção
- [ ] Domínio do Resend verificado para envio
- [ ] URLs de redirect do Supabase Auth apontando para o domínio de produção
- [ ] Smoke test em produção: signup → onboarding → lead → negócio → upgrade
- [ ] README atualizado com o link de produção

### Validação

Fluxo completo executado em produção com uma conta nova, incluindo um pagamento de teste e a chegada de um convite por e-mail.

**Commit final:** `chore: production hardening and deploy configuration`

---

## Dependências entre milestones

```
M1 ──> M2 ──┬──> M3  landing, independente do shell
            └──> M4 ──> M5
                  │
                  ├──> M6 ──┐
                  ├──> M7 ──┤
                  ├──> M8 ──┼──> M10 ──> M11 ──┬──> M12 ──> M13 ──> M14
                  └──> M9 ──┘                  ├──> M15
                                               └──> M16
                                                      │
                                                      M17
```

- **M3** pode ser feito a qualquer momento da Fase 1 — não depende do shell.
- **M10** é o gargalo: nada da Fase 3 começa antes dele.
- **M14** depende de M12 e M13 (precisa de leads e negócios reais para agregar).
- **M16** depende de M12 e M15 (os limites do Free incidem sobre criar lead e convidar membro).
- **M17** só começa com todos os anteriores concluídos.
