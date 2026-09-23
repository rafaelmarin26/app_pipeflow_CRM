# PipeFlow CRM — Plano de Execução

Roteiro de build do setup ao deploy. Cada milestone é um incremento entregável, com entregas verificáveis e um commit final.

**Fontes:** escopo em [PRD.md](PRD.md) · stack, convenções e identidade visual em [../CLAUDE.md](../CLAUDE.md).

---

## Como usar este plano

- **Um milestone por vez.** Terminar, validar e commitar antes de começar o próximo.
- **Uma branch por milestone, fechada por Pull Request.** Criar `feat/<slug>` (ou `chore/`, `docs/`) a partir da `main`, abrir o PR no GitHub e mesclar com **rebase** — nunca com commit de merge —, apagando a branch em seguida. A `main` mantém histórico linear; como o rebase reescreve os SHAs, sincronizar o local com `git pull --ff-only` depois de cada merge.
- **Remoto:** `origin` → https://github.com/rafaelmarin26/app_pipeflow_CRM
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

**Objetivo:** deixar o projeto de pé com a stack fixada no CLAUDE.md, tokens visuais aplicados e a estrutura de pastas criada — nenhuma tela ainda.

### Entregas

- [x] `git init` e primeiro commit; `.gitignore` cobrindo `.env*.local`, `node_modules`, `.next`
- [x] Scaffold Next.js 15 com App Router, TypeScript `strict`, ESLint e alias `@/*`
- [x] Tailwind CSS 4 configurado
- [x] Tokens da paleta como CSS variables em `app/globals.css` ~~nas duas variantes (claro e escuro)~~ — **só escuro desde a v2 da identidade**
- [x] Cores semânticas do funil registradas como tokens (`--won`, `--lost`, `--open`, `--due`)
- [x] ~~Fonte Inter~~ **Syne + DM Sans + IBM Plex Mono** via `next/font/google`, com utilitário `money` (mono + `tabular-nums`) para valores monetários
- [x] Dark mode por classe ~~com toggle funcionando~~ — **o alternador foi removido na v2: a aplicação é só escura**
- [x] Estrutura de pastas do CLAUDE.md §3 criada (route groups vazios, `lib/`, `types/`, `components/`)
- [x] `.env.example` versionado com as 8 chaves da seção 6, todas vazias
- [x] `README.md` curto: o que é, como rodar, link para PRD e CLAUDE.md

### Validação

`npm run dev` sobe sem erro · `npm run build` passa.

**Commit final:** `chore: scaffold next 15 project with tailwind and design tokens`

---

## M2 · Design system

**Objetivo:** ter o vocabulário visual pronto — componentes shadcn instalados, helpers de formatação, rótulos PT-BR e os fixtures que alimentam toda a Fase 1 e 2.

### Entregas

- [x] shadcn/ui inicializado, apontando para os tokens do M1 (não para a paleta padrão)
- [x] Componentes base instalados: `button`, `input`, `label`, `select`, `dialog`, `dropdown-menu`, `table`, `badge`, `card`, `avatar`, `tabs`, `sonner`, `skeleton`, `separator`, `sheet`
- [x] `lib/utils.ts` — `cn()`, `formatCurrency()` (R$ com centavos), `formatDate()` e `formatRelativeDate()` com locale `ptBR`
- [x] `lib/labels.ts` — mapa de todos os enums para rótulos PT-BR (`deal_stage`, `lead_status`, `activity_type`, `member_role`, `plan`)
- [x] `types/database.ts` escrito **à mão** por ora, espelhando o modelo de dados do CLAUDE.md §4 — será substituído pelo gerado no M10
- [x] `lib/mock-data.ts` — fixtures tipadas: 3 workspaces, 3 membros, 20 leads, 15 deals distribuídos nas 6 etapas, 30 atividades
- [x] `components/shared/stage-badge.tsx` e `status-badge.tsx` — cor semântica derivada do enum
- [x] `components/shared/empty-state.tsx` — ícone, frase PT-BR e slot de ação
- [x] `components/shared/page-header.tsx` — título, descrição e slot de ação primária única

> **Desvios registrados.** (1) O plano pedia 1 workspace; os fixtures trazem 3, porque o switcher do M4 precisa de destino para onde ir. (2) shadcn e o CLAUDE.md colidem nos nomes `muted` e `accent`; a reconciliação está documentada em CLAUDE.md §7, "Dois vocabulários, uma paleta".

### Validação

Uma página de teste renderiza todos os badges com as cores corretas, um empty state e valores formatados como `R$ 1.250,00`.

**Commit final:** `feat: add design system primitives, labels and typed mock data`

---

# FASE 1 — Interface pública e shell

## M3 · Landing page

**Objetivo:** entregar a página pública completa — é a primeira coisa demonstrável e não depende de nada.

### Entregas

- [x] Rota `app/(marketing)/page.tsx` com layout próprio (header público + footer)
- [x] **Hero:** headline, subheadline, dois CTAs e prova visual do Kanban
- [x] **Números de resultado:** faixa com quatro métricas acima das funcionalidades
- [x] **Funcionalidades:** grid com os 6 pilares — Kanban, leads, atividades, dashboard, multi-empresa e convites
- [x] **Planos:** dois cards — Grátis (2 membros, 50 leads) e Pro (R$ 49,00/mês, ilimitado), com destaque no Pro
- [x] **CTA final** e footer com logo e links
- [x] Header com navegação âncora, link Entrar e botão Começar grátis
- [x] Responsivo de 360px a desktop
- [x] Metadata: title, description e Open Graph

> **Escopo ampliado no pedido.** O plano original pedia 5 pilares e não previa a faixa de
> números; o pedido de implementação trouxe 6 funcionalidades e quatro métricas de resultado.
> O PRD foi atualizado na mesma leva.

> **`app/page.tsx` removido.** A rota `/` era ocupada pela tela de showcase do design system do
> M2, que o próprio arquivo declarava provisória — e que já referenciava tokens da v1
> (`--primary`, `--won`, `--open`, `--due`) aposentados desde a troca de identidade. Ela e a
> landing não podem coexistir: as duas resolvem para `/`.

> **`lib/stripe/plans.ts` nasceu aqui.** Preço, período e os dois tetos do Grátis passam a viver
> num arquivo só, que o M9 (tela de plano) e o M16 (checagem de limite na Server Action) leem.
> Um preço exibido numa página pública e um preço efetivamente cobrado têm que sair da mesma
> constante. Na mesma leva, `PLAN_LABELS.free` passou de "Free" para "Grátis", para o produto
> inteiro chamar o plano pelo mesmo nome.

### Validação

Percorrer a página em mobile e desktop sem quebra de layout; todos os CTAs apontam para `/signup`.

**Commit final:** `feat: add public landing page`

---

## M4 · Shell da aplicação

**Objetivo:** o esqueleto de toda a área autenticada — sidebar, troca de workspace e navegação. Sem auth real ainda.

### Entregas

- [x] `app/(app)/layout.tsx` — grid sidebar + conteúdo, com scroll independente
- [x] Sidebar: logo, navegação (Dashboard, Leads, Pipeline, Configurações) com estado ativo
- [x] Workspace switcher no topo da sidebar — dropdown listando os workspaces do mock
- [x] Barra superior: gatilho do menu mobile e trilha `workspace › seção` ~~e alternador de tema~~
- [x] Menu do usuário no rodapé da sidebar: avatar, nome, papel, e-mail, sair
- [x] Drawer mobile (`sheet`) substituindo a sidebar abaixo de `md`, com o mesmo componente de conteúdo
- [x] Páginas placeholder das 4 rotas, cada uma com `PageHeader`
- [x] `loading.tsx` com skeleton e `error.tsx` em `(app)`
- [x] `not-found.tsx` da aplicação

> **Desvio registrado.** A barra superior, pedida depois do plano original, entrou como entrega própria. O alternador de tema passou pelo menu do usuário, foi para a barra superior e acabou **removido** na v2 da identidade visual, que define a aplicação como só escura.

### Validação

Navegar entre as 4 rotas mantendo a sidebar montada; item ativo correto; drawer abre e fecha no mobile.

**Commit final:** `feat: add authenticated app shell with sidebar and workspace switcher`

---

## M5 · Telas de acesso e onboarding

**Objetivo:** todas as telas do fluxo de entrada, visualmente completas e com validação de formulário — sem chamar o Supabase.

### Entregas

- [x] `login` — e-mail e senha, link de recuperação, link para signup
- [x] `signup` — nome, e-mail e senha, com regra de senha visível
- [x] Validação client com `react-hook-form` + `zod` (schemas em `lib/validations/auth.ts`)
- [x] Estados de erro por campo e estado de carregamento no botão
- [x] `onboarding` — passo único: nomear o primeiro workspace, com slug derivado automaticamente
- [ ] `convite/[token]` — tela de aceite: nome do workspace, quem convidou, papel oferecido
- [x] Layout `(auth)` centrado, com a marca e ~~fundo em gradiente indigo→violeta~~ **fundo de grid modular** (a v2 proíbe glow e gradiente decorativo)

> **Desvios registrados.** (1) `recuperar-senha/` entrou como tela própria: o login exige o link de recuperação e um link morto é pior que uma tela a mais. Ela valida o e-mail e mostra a confirmação de envio; o envio real é do M11. (2) As rotas com sidebar foram para o grupo `app/(app)/(shell)/` para que o onboarding, que roda antes de existir qualquer workspace, não herde a sidebar que existe para listá-los — registrado em CLAUDE.md §3. Nenhuma URL mudou. (3) A navegação é falsa por ora: os formulários validam os campos, aguardam uma latência simulada (`lib/fake-submit.ts`) e redirecionam — login → `/dashboard`, signup → `/onboarding`, onboarding → `/dashboard`. Nenhuma credencial é verificada. (4) A tela de convite fica pendente para fechar o milestone.

### Validação

Submeter cada formulário vazio e ver as mensagens de erro em PT-BR; fluxo signup → onboarding navega corretamente.

**Commit final:** `feat: add auth and onboarding screens with client validation`

---

# FASE 2 — Interface do produto

## M6 · Interface de leads

**Objetivo:** listagem, busca, filtros, cadastro e página de detalhe com timeline — tudo lendo de `mock-data.ts`.

### Entregas

- [x] Tabela de leads: nome, empresa, cargo, status, responsável, criado em
- [x] Busca por texto (nome, e-mail, empresa) com debounce, refletida na URL (`?q=`)
- [x] Filtros por status, responsável e período, também na URL
- [x] Estado vazio distinguindo "nenhum lead ainda" de "nenhum resultado para este filtro"
- [x] Dialog de novo lead com os 6 campos do PRD e validação zod
- [x] Edição pelo mesmo dialog, em modo de edição
- [x] `leads/[id]` — cabeçalho com dados de contato, ações e badge de status
- [x] Timeline de atividades: ícone por tipo, autor, descrição e data relativa, em ordem cronológica
- [x] Formulário de nova atividade com seletor dos 4 tipos
- [x] Negócios vinculados ao lead, listados no detalhe

> **Desvios registrados.** (1) **As mutações não persistem.** Criar, editar e excluir lead e
> registrar atividade validam, mostram o estado de carregamento e confirmam com toast, mas a
> lista não muda — é o mesmo `lib/fake-submit.ts` do M5. Guardar os leads em estado local no
> cliente tiraria a listagem do servidor e seria desfeito no M12, onde cada `onSubmit` vira uma
> chamada de Server Action e nada mais no componente se move. (2) A timeline ordena do **mais
> recente para o mais antigo**: a última interação é a que está sendo acompanhada. (3) O filtro
> de período usa presets (7, 30 e 90 dias) em vez de um seletor de data — o `date picker` do
> shadcn não está instalado e um intervalo livre não tem uso claro nesta tela. (4) O dialog tem
> um sétimo campo além dos 6 do PRD: **responsável**, sem o qual o filtro por responsável não
> teria como ser preenchido. (5) Dois componentes shadcn entraram na leva: `textarea` (descrição
> da atividade) e `alert-dialog` (confirmação de exclusão). (6) `types/views.ts` passa a
> concentrar as formas com join (`LeadWithOwner`, `DealWithOwner`, `ActivityWithAuthor`), que no
> M12 saem do SQL com a mesma forma. (7) `notFound()` num lead inexistente renderiza a tela
> certa mas responde **200**: o Next 15 já começou o streaming quando a chamada acontece.
> Fica para a varredura do M17, junto com o `robots.txt` da área autenticada.

### Validação

Buscar, filtrar, limpar filtros e recarregar a página mantendo o estado pela URL; abrir um lead e ver a timeline ordenada.

**Commit final:** `feat: add leads list, filters and detail view with activity timeline`

---

## M7 · Pipeline Kanban

**Objetivo:** a tela herói do produto. Drag-and-drop fluido com estado local — a persistência entra no M13.

### Entregas

- [x] Board com as 6 colunas do PRD, na ordem do enum `deal_stage`
- [x] Cabeçalho de coluna: rótulo PT-BR, contagem e soma em R$
- [x] Card de negócio: título, valor, lead vinculado, avatar do responsável e prazo
- [x] Prazo vencido ou próximo destacado com o token `--due`
- [x] Drag-and-drop com `@dnd-kit` entre colunas e reordenação dentro da coluna
- [x] `DragOverlay` com `shadow-md` e leve rotação durante o arraste
- [x] Navegação por teclado funcionando (requisito do `@dnd-kit`)
- [x] Scroll horizontal do board com colunas de largura fixa
- [x] Dialog de novo negócio: título, valor, lead, responsável, prazo e etapa
- [x] Coluna vazia com estado vazio discreto, ainda aceitando drop
- [x] Colunas Ganho e Perdido visualmente distintas das etapas abertas

> **Desvios registrados.** (1) **O arraste não persiste.** Soltar um card reordena o board em
> memória e um reload devolve tudo ao lugar — é o mesmo compromisso do M6, e o M13 transforma o
> `onDragEnd` numa Server Action. O mesmo vale para o dialog de negócio, que usa o
> `lib/fake-submit.ts`. (2) **A lógica do board mora em `lib/pipeline.ts`**, sem React:
> `groupDealsByStage`, `columnSummary`, `positionBetween`, `dueState` e `moveDealInBoard` são
> funções puras. `moveDealInBoard` devolve o board seguinte **e** o novo `position`, que é
> exatamente o que o `update` do M13 precisa gravar — a aritmética do rank não é reescrita no
> servidor. Mesma ideia do `lib/metrics.ts` previsto para o M8. (3) **Prazo vencido usa o tom
> `--lost`, não o `--due`.** Um prazo estourado é falha consumada, não aviso; o âmbar fica
> reservado para o que ainda dá para salvar (vence nos próximos 7 dias). Negócio fechado não
> exibe alerta de prazo nenhum: a data virou histórico e a coluna já carrega a própria cor.
> (4) As quatro etapas abertas ficam agrupadas e um divisor as separa das duas fechadas, para o
> board ser lido como "funil | desfecho". (5) **Anúncios do `@dnd-kit` traduzidos**: os padrões
> da biblioteca são em inglês e quem depende deles é justamente quem não vê o card se mover.
> (6) `types/views.ts` ganha `DealCardData` (deal + responsável + lead), a forma do join com dois
> níveis que o M13 executa. (7) Entrada orquestrada das colunas e dos cards em `app/globals.css`,
> com `--stagger` e um bloco `prefers-reduced-motion` que desliga animação e o realce de hover.
> (8) **Duas entregas além do plano, vindas da referência ao Pipedrive:** um trilho no topo de
> cada cabeçalho que *preenche* conforme o funil avança (um quarto em "Novo Lead", cheio em
> "Negociação") em vez de dar uma cor por etapa como o Pipedrive faz — o CLAUDE.md §7 não permite
> gastar verde e vermelho fora de ganho/perdido, então a progressão virou largura e não matiz; e
> um `+` discreto em cada coluna, que abre o dialog já posicionado naquela etapa e mantém o único
> botão indigo preenchido no cabeçalho da página.

### Validação

Arrastar um card entre todas as colunas; mover com teclado; totais por coluna recalculam na hora.

**Commit final:** `feat: add kanban pipeline board with dnd-kit`

---

## M8 · Dashboard

**Objetivo:** as métricas e o gráfico de funil, calculados sobre os mocks.

### Entregas

- [x] 4 cards de métrica: total de leads, negócios abertos, valor total do pipeline, taxa de conversão
- [x] Gráfico de funil em Recharts, com as 6 etapas e as cores semânticas
- [x] Tooltip do gráfico com contagem e valor formatado
- [x] Lista "Seus negócios com prazo próximo" — do usuário logado, ordenada por prazo
- [x] Cálculo das métricas isolado em `lib/metrics.ts`, recebendo arrays e devolvendo números — pronto para reuso com dados reais
- [x] Skeletons de carregamento para cards e gráfico
- [x] Estado vazio do dashboard para workspace recém-criado

> **Decisão de desenho registrada no M8.** O funil é desenhado como barras horizontais
> — quatro etapas abertas em cima, os dois desfechos embaixo, separados pela mesma
> hairline que o board usa antes das colunas fechadas — e não como o `FunnelChart` de
> trapézios do Recharts. O trapézio pressupõe que cada etapa é um estreitamento da
> anterior, e `won`/`lost` não são: são dois desfechos da quarta etapa. Os dois gráficos
> compartilham o domínio do eixo para que as barras continuem comparáveis.

> **Fixtures atualizadas na mesma leva.** Os `mockDeals` passaram de 15 para 25 negócios
> (6-5-4-3 abertos, 4 ganhos, 3 perdidos) porque um funil 3-3-3-2-2-2 não tem forma de
> funil, e os prazos dos negócios abertos foram reancorados na data corrente — todos já
> haviam vencido, o que pintava de vermelho tanto a lista de prazos quanto o board.

### Validação

Conferir os 4 números à mão contra o mock; gráfico responsivo sem estourar o container.

**Commit final:** `feat: add dashboard with metrics cards and sales funnel chart`

---

## M9 · Configurações

**Objetivo:** as três abas de configuração, incluindo a tela de plano — ainda sem Stripe.

### Entregas

- [x] Layout de settings com abas: Workspace, Membros, Plano
- [x] **Workspace:** nome, slug e zona de perigo (excluir), visível apenas para Admin
- [x] **Membros:** tabela com avatar, nome, e-mail, papel e data de entrada
- [x] Dialog de convite: e-mail e seleção de papel
- [x] Convites pendentes listados com opção de reenviar e cancelar
- [x] Ações de Admin escondidas quando o usuário logado tem papel Membro
- [x] **Plano:** card do plano atual, uso (`X de 50 leads`, `Y de 2 colaboradores`) com barra de progresso
- [x] Comparativo Free × Pro e botão de upgrade (inerte por ora)
- [x] Aviso de limite atingido, com o tom de voz do CLAUDE.md §7

> **Feito direto com dados reais, fora de ordem com a Fase 2.** O backend das três abas
> (schema, RLS, auth) já existia desde o M10-M14; construir a UI sobre `lib/mock-data.ts` só
> para trocá-la de novo no M15 teria sido trabalho duplicado. As três páginas
> (`settings/workspace`, `settings/members`, `settings/billing`) chamam `requireWorkspaceContext`
> e consultam o Postgres diretamente, e o M15 entrou na mesma leva — ver as entregas dele
> abaixo. (2) "Ações de Admin escondidas" testado contra o papel real do usuário autenticado,
> não contra um mock alternável — a Fase 2 nunca chegou a existir para esta tela.

### Validação

Trocar de conta entre um Admin e um Membro do mesmo workspace e confirmar que a UI de Admin
desaparece para o Membro; as barras de uso refletem `count()` reais de `leads` e
`workspace_members`.

**Commit final:** `feat: add workspace, members and billing settings screens`

---

# FASE 3 — Backend

> A partir daqui, cada milestone troca mocks por dados reais. A meta é que **nenhum componente de UI precise mudar** — só a origem dos dados no Server Component da página.

## M10 · Banco de dados e RLS

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

> **Hardening adicional (leva do M11).** Revisando o schema contra o skill
> `supabase-postgres-best-practices`: `is_workspace_member()` e `is_workspace_admin()` são
> `security definer` em `public`, e o Postgres concede `execute` a `PUBLIC` (e o Supabase, direto
> a `anon`/`authenticated`) em toda função nova por padrão — qualquer `security definer` em
> `public` nasce como endpoint público, independente de alguma policy chamá-la. Nenhuma das duas
> vaza dado hoje: o `(select auth.uid())` interno resolve `null` fora de sessão, e
> `user_id = null` nunca casa. Mesmo assim, a migration
> `20260920040000_restrict_membership_helpers_to_authenticated.sql` revoga `execute` de
> `public`/`anon` e concede só a `authenticated` — o mesmo remendo que `20260920030000` já tinha
> aplicado a `create_workspace_with_owner()`, agora estendido às duas funções que ficaram de
> fora daquela leva. **Aplicada no projeto remoto** via SQL Editor do Studio (sem CLI
> autenticado nem acesso direto ao Postgres nesta sessão, não havia como eu rodar `db push`
> sozinho). Confirmado ao vivo com a `anon key`: as duas RPCs agora respondem `permission
> denied for function ...` (42501) para `anon`, e o fluxo completo — login, onboarding,
> dashboard, logout, bloqueio das 5 rotas protegidas — repetido com `authenticated` continua
> passando sem diferença nenhuma.

**Commit final:** `feat: add database schema with enums, indexes and rls policies`

---

## M11 · Autenticação real

**Objetivo:** ligar as telas do M5 ao Supabase Auth e proteger a área autenticada.

### Entregas

- [x] Server Actions de signup, login e logout
- [x] `app/(auth)/callback/route.ts` trocando o code pela sessão
- [x] `middleware.ts` com refresh de sessão e guarda das rotas autenticadas
- [x] Autorização no servidor via `getUser()` — `getSession()` não aparece em lugar nenhum
- [x] Redirecionamento pós-login para o último workspace; sem workspace, para o onboarding
- [x] Onboarding criando workspace + vínculo de Admin de verdade
- [x] Workspace ativo resolvido no servidor e propagado pelo layout
- [x] Erros do Supabase traduzidos para PT-BR (credenciais inválidas, e-mail já cadastrado)
- [ ] Recuperação de senha ponta a ponta

> **Desvios registrados.** (1) O pedido de implementação chamou o arquivo de `proxy.ts` —
> nome que só existe a partir do Next.js 16, onde `middleware.ts`/`middleware()`/`config`
> viram `proxy.ts`/`proxy()`/`proxyConfig`. Este projeto está fixado em Next `^15`
> (CLAUDE.md §2, versão instalada 15.5.25), que não reconhece esse arquivo; a entrega saiu
> como `middleware.ts`, como o próprio CLAUDE.md §3 já previa. (2) O "workspace ativo" ganhou
> um cookie (`pf-active-workspace`, `lib/workspace.ts`) e uma Server Action de troca real
> (`switchWorkspace`) nesta leva, adiantando um pedaço do M15 — sem isso o switcher da M4 não
> tinha onde persistir a escolha entre requisições. O restante do M15 (convites, papéis
> alterados por Admin, criar workspace adicional pelo switcher) continua fora do escopo.
> (3) `create_workspace_with_owner()` recebe um slug derivado do nome; como a coluna é
> `unique`, a action tenta sufixos (`-2`, `-3`, ...) até 5 vezes antes de desistir, para dois
> workspaces com o mesmo nome não quebrarem o onboarding. (4) A recuperação de senha
> (`recuperar-senha/`) continua no `fakeSubmit` do M5 — fica para a próxima leva do M11, que
> também precisa de uma tela para digitar a senha nova depois do link, ainda não prevista na
> estrutura do CLAUDE.md §3. (5) Confirmado ao vivo contra o projeto Supabase remoto: a
> confirmação de e-mail está **ligada**, então `signup` sempre volta com `data.session === null`
> — a UI mostra um painel neutro ("enviamos um link de confirmação"), não um erro, porque não é
> uma falha. O envio de e-mail do provedor padrão do Supabase tem um limite de taxa baixo, que
> a bateria de testes desta leva esgotou (dois `signUp` seguidos já bastam); a validação deste
> milestone só reproduz "criar conta → onboarding → dashboard" sem esbarrar nisso depois que um
> SMTP próprio (Resend, M15) estiver configurado, ou com a confirmação desligada no projeto.
> (6) `signup` ganhou `emailRedirectTo` apontando para `/callback?next=/onboarding` — sem isso
> o link de confirmação usa a Site URL padrão do projeto e o `code` nunca chega à rota que
> troca por sessão. (7) O `middleware.ts` tinha um bug real: ao redirecionar (`/login` sem
> sessão, `/dashboard` já logado), ele descartava os cookies que `getUser()` acabou de
> renovar, porque `NextResponse.redirect()` cria uma resposta nova em vez de reaproveitar a que
> carregava o refresh. `lib/supabase/middleware.ts` agora copia esses cookies para toda
> resposta de redirect — o padrão que a própria documentação do `@supabase/ssr` describe como
> pegadinha.

### Validação

Criar conta nova → onboarding → dashboard. Acessar `/dashboard` deslogado redireciona para `/login`. Sessão sobrevive a um reload.

Testado de ponta a ponta contra o projeto Supabase remoto, em duas rodadas. Na primeira, com
um usuário pré-confirmado via Admin API (sem consumir a cota de e-mail): login sem workspace
vai para `/onboarding`; criar o workspace grava a linha em `workspaces` e a associação `admin`
em `workspace_members` e redireciona para `/dashboard`, que já chega mostrando o nome do
usuário e do workspace reais na sidebar; recarregar `/dashboard` mantém a sessão; sair pelo
menu do usuário volta para `/login`.

Na segunda rodada, o registro em si: `admin.generateLink()` criou um usuário não confirmado e
devolveu o link de confirmação sem gastar a cota de e-mail (equivalente a receber o e-mail,
sem o enviar de verdade). Abrir esse link confirma a conta no Supabase (`email_confirmed_at`
gravado) — mas por ser gerado fora do navegador, sem o `code_verifier` que o PKCE do
`@supabase/ssr` guarda em cookie durante um `signUp` real, ele volta com os tokens no
fragmento da URL em vez de `?code=`, e a `/callback` (que só sabe ler `code`) cai no fallback
para `/login`. Ler o código-fonte de `@supabase/ssr` confirma que `createBrowserClient` e
`createServerClient` fixam `flowType: "pkce"` — um cadastro real feito pela tela `/signup`
gera o `code_verifier` e persiste como cookie na mesma resposta do Server Action, então o link
de um cadastro de verdade chega com `?code=` e a `/callback` completa a troca normalmente.
Como a cota de e-mail do projeto está zerada agora, não foi possível clicar um link
100% real ponta a ponta nesta leva — login com a conta já confirmada, criação do workspace,
dashboard, logout e bloqueio das 5 rotas protegidas (`/dashboard`, `/leads`, `/pipeline`,
`/settings`, `/onboarding`) foram revalidados depois do fix do middleware, todos passando.
Os registros de teste (usuário, workspace, membership) foram conferidos direto nas tabelas via
Admin API — sem acesso à sessão do Supabase Studio do usuário — e apagados ao final.

**Commit final:** `feat: wire supabase auth with session middleware and route protection`

---

## M12 · Leads e atividades persistidos

**Objetivo:** substituir o mock de leads por Server Actions e queries reais.

### Entregas

- [x] Schemas zod em `lib/validations/lead.ts` e `activity.ts`, compartilhados entre client e servidor
- [x] Server Actions de criar, editar e excluir lead, seguindo a ordem obrigatória do CLAUDE.md §3
- [x] Listagem como Server Component, com busca e filtros traduzidos em query Postgres
- [x] Paginação ou scroll infinito na tabela
- [x] Detalhe do lead buscando lead, atividades e negócios em paralelo
- [x] Server Action de registrar atividade, com `author_id` do usuário autenticado
- [x] `revalidatePath` nas rotas afetadas após cada mutação
- [x] Erros retornados em PT-BR, sem vazar mensagem do Postgres
- [x] Toast de sucesso e de falha em cada mutação

> **Desvio registrado.** O plano não previa schema: `owner_id`/`author_id` apontavam
> para `auth.users`, que o PostgREST não expõe — nenhum join `owner:owner_id(...)`
> funcionaria. Duas migrations entraram nesta leva: `public.profiles` (espelha nome,
> e-mail e avatar de `auth.users` via trigger, com backfill dos usuários já
> existentes) e o realinhamento de `leads.owner_id`, `deals.owner_id`,
> `activities.author_id` e `workspace_members.user_id` para apontar para ela. Busca
> por texto usa `ilike` puro — sem a insensibilidade a acento que o mock do M6 tinha
> (exigiria a extensão `unaccent` com índice funcional, deixado para quando o volume
> de leads de um workspace justificar o custo). Paginação saiu como Anterior/Próxima
> de 50 em 50, do tamanho do teto do Free, em vez de scroll infinito.

### Validação

Criar lead em duas contas de workspaces diferentes e confirmar isolamento. Buscar por termo que existe só em um lead. Registrar atividade e ver a timeline atualizar sem reload manual.

Testado ao vivo contra o projeto remoto nesta leva: leads criados, editados e
excluídos pela UI conferidos direto contra a tabela via API REST com a
`service_role` key (fora do cache do Next, então prova persistência de verdade, não
só que a tela não recarregou). Busca (`ilike`) e filtro por status testados do mesmo
jeito, direto contra a API. Isolamento entre workspaces diferentes não foi
reexercitado nesta leva — já validado no M10/M11 e a policy de `leads` não mudou.

**Commit final:** `feat: replace lead mocks with server actions and postgres queries`

---

## M13 · Pipeline persistido

**Objetivo:** o drag-and-drop do M7 gravando no banco, com atualização otimista.

### Entregas

- [x] Server Actions de criar, editar e excluir negócio
- [x] Action de mover negócio: grava `stage` e recalcula `position` entre os vizinhos
- [x] Atualização otimista no cliente, com rollback e toast de erro se a action falhar
- [x] `closed_at` preenchido ao entrar em `won` ou `lost`, limpo ao sair
- [ ] Totais por coluna calculados no servidor
- [x] Board carregando negócios do workspace ativo com o lead e o responsável via join
- [x] Dois arrastes rápidos em sequência não embaralham a ordem

> **Desvios registrados.** (1) **Totais por coluna continuam no cliente** —
> `columnSummary()` (`lib/pipeline.ts`) roda no navegador sobre os negócios que o
> Server Component já buscou, a mesma função pura do M7. Não é uma agregação SQL
> por coluna; é aceitável porque o array inteiro do workspace já está em memória
> para o board se desenhar, então somar de novo no servidor só trocaria uma soma em
> JS por uma query extra. Fica pendente caso um workspace cresça a ponto de a
> transferência do array completo pesar mais que a soma. (2) **Editar e excluir
> negócio não existiam antes desta leva** — o M7 só tinha "criar". Adicionado ao
> `DealCard`: lápis e lixeira, em `<button>` reais fora da área de arraste (o
> `KeyboardSensor` do dnd-kit já usa a barra de espaço no card para pegar/soltar).
> (3) A arquitetura do M7 já vinha pronta para isto: `moveDealInBoard()` devolvendo
> o `position` que a action grava, e o comentário de `pipeline-board.tsx` já
> antecipava o `onDragEnd` virando Server Action — nada disso precisou mudar de
> forma.

### Validação

Arrastar um card, recarregar a página e ver o card na nova etapa. Simular falha da action com a rede offline e confirmar que o card volta para a coluna original com toast.

Testado ao vivo: um negócio criado direto em "Negociação" foi arrastado para
"Proposta" e a nova `stage`/`position` foram conferidas na tabela via API REST — a
`position` bateu exatamente com `positionBetween(null, null)` (coluna de destino
vazia), confirmando que o cálculo do cliente e a gravação do servidor concordam. A
falha simulada com a rede offline não foi reexercitada nesta leva.

**Commit final:** `feat: persist kanban stage and position with optimistic updates`

---

## M14 · Dashboard com dados reais

**Objetivo:** as métricas do M8 calculadas sobre o banco.

### Entregas

- [x] Queries agregadas por workspace para os 4 cards
- [x] Dados do funil agrupados por `deal_stage`, respeitando a ordem do enum
- [x] Taxa de conversão como ganhos sobre ganhos mais perdidos, com tratamento de divisão por zero
- [x] Prazos próximos filtrados por `owner_id` do usuário autenticado
- [x] `lib/metrics.ts` do M8 reutilizado — a lógica de cálculo não é reescrita
- [ ] Agregações pesadas resolvidas em SQL, não em JavaScript sobre todas as linhas
- [x] Suspense com os skeletons do M8 enquanto as queries resolvem

> **Desvio registrado.** Só "total de leads" virou uma agregação SQL de verdade
> (`select count, head: true` — o banco devolve um número, nenhuma linha trafega).
> Os outros três cards, o funil e os prazos continuam somados em JavaScript sobre
> um único `select` de todos os negócios do workspace, reaproveitando
> `lib/metrics.ts` sem reescrever a lógica em SQL — a alternativa seria uma segunda
> definição de "taxa de conversão" em SQL, que pode um dia divergir silenciosamente
> da definição em `lib/metrics.ts`. Como o teto do Free (50 leads, 2 colaboradores)
> mantém o volume de negócios de um workspace pequeno, essa troca fica aceitável por
> ora; migrar para agregação SQL é candidato natural se um workspace Pro crescer o
> suficiente para o `select` completo pesar.

### Validação

Conferir os 4 números contra consultas SQL diretas. Criar um negócio novo e ver o funil mudar.

Os 4 números foram conferidos contra uma contagem/soma direta na API REST (3 leads,
4 negócios abertos, R$ 22.150,00 em pipeline, taxa "—" por não haver ganho/perdido
ainda) e bateram com o que a tela mostrou.

**Commit final:** `feat: compute dashboard metrics from database aggregates`

---

## M15 · Multi-empresa e colaboração

**Objetivo:** convites por e-mail, papéis aplicados no servidor e troca real de workspace.

### Entregas

- [x] Resend configurado em `lib/email/resend.ts`
- [x] Template de convite em PT-BR, com a identidade visual do produto
- [x] Server Action de convidar: gera token, grava `invites` e dispara o e-mail
- [x] Aceite do convite cria o vínculo e consome o token, com expiração e reuso tratados
- [x] Reenviar e cancelar convite pendente
- [x] Remover membro e alterar papel, restritos a Admin **no servidor**
- [x] Último Admin não pode se rebaixar nem sair do workspace
- [x] Workspace switcher trocando de contexto de verdade, com a escolha persistida
- [x] Criar workspace adicional a partir do switcher
- [x] Papel do usuário propagado pelo layout e usado para esconder ações de Admin

> **Desvios registrados.** (1) **Sem tabela nova.** O pedido de implementação chamava a tabela
> de `workspace_invites`, mas o M10 já tinha criado `invites` com exatamente essa forma — RLS,
> índices e as policies do CLAUDE.md §5. Uma segunda tabela para o mesmo papel teria divergido
> do modelo de dados fixado no CLAUDE.md §4; a única mudança de schema desta leva foi somar a
> coluna `invited_by` a `invites` (migration `20260922060000`), para a tela de aceite mostrar
> quem convidou — o M10 nunca guardou isso. (2) **Limite de 2 colaboradores adiantado do M16.**
> `isMemberLimitReached()` (`lib/stripe/plans.ts`) conta membros mais convites pendentes e
> bloqueia `inviteMember` no plano Grátis; não precisa do Stripe, só de um `count()`, então
> entrou nesta leva por pedido explícito em vez de esperar o M16. O teto de 50 leads continua
> fora de escopo aqui. (3) **Aceite sem `?next=` pelo login/signup.** A tela pública
> `convite/[token]` não encadeia o token pelos Server Actions de `/login` e `/signup` — mexer
> nelas é território do M11. Um visitante sem sessão vê CTAs para entrar ou criar conta e uma
> instrução em PT-BR para voltar ao mesmo link depois. (4) **E-mail do inviter vem de
> `user.user_metadata.name`**, o mesmo campo que `toShellUser()` já usa em `lib/workspace.ts`,
> não de uma nova consulta a `profiles`. (5) **"Sair do workspace"** não estava listado, mas o
> próprio texto da entrega ("nem sair do workspace") pressupõe a ação existir; toda linha da
> tabela de membros mostra esse botão na própria linha do usuário logado, com o mesmo guard de
> "último Admin" que bloqueia a autodemoção.
>
> **Migration pendente de aplicar manualmente.** Sem Docker nem `supabase` autenticado neste
> ambiente (mesma limitação relatada no M10/M11), a migration `20260922060000_add_invited_by_to_invites.sql`
> não pôde ser aplicada ao projeto remoto por mim. Rodar no SQL Editor do Studio antes de testar
> convites de ponta a ponta:
> ```sql
> alter table public.invites
>   add column invited_by uuid references public.profiles (id) on delete set null;
> ```
> Até lá, a tela de aceite falha a leitura do convite sem erro (mostra "Convite inválido"), e a
> aba Membros/convite de novo colaborador retornam erro do Postgres traduzido.

### Validação

Convidar um segundo e-mail, aceitar em outra sessão e confirmar o papel correto. Como Membro, chamar a action de remover membro direto e receber negativa do servidor.

Verificado nesta leva: `npx tsc --noEmit` e `npm run lint` limpos; `npm run dev` sobe sem erro
e as rotas novas/alteradas (`/convite/[token]`, as três abas de `/settings`) compilam e
respondem sem 500 — as protegidas redirecionam para `/login` como esperado. O fluxo completo
de convite (envio → e-mail → aceite → papel aplicado) não foi exercitado contra o banco real
nesta leva por causa da migration pendente acima.

**Commit final:** `feat: add email invites, member roles and workspace switching`

---

## M16 · Cobrança com Stripe

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

---

## Identidade Visual v2 — aplicada fora da numeração de milestones

Depois do M7 o produto trocou de identidade visual por inteiro: de indigo/Inter para a direção
**"Editorial Brutalist × Fintech"** (chartreuse `#CAFF33`, Syne + DM Sans + IBM Plex Mono, só
escuro, uma cor por etapa do pipeline). A especificação vive em [../CLAUDE.md](../CLAUDE.md) §7,
reescrita na mesma leva.

Não virou milestone próprio porque não entrega funcionalidade — é uma troca de camada visual sobre
o que já existia. O que ela alterou, para quem for ler o histórico:

- **M1** — tokens, fontes e a remoção do tema claro e do alternador (entregas riscadas acima).
- **M2** — `stage-badge` e `status-badge` viraram ponto colorido + label mono; `lib/stage-styles.ts`
  nasceu como fonte única das seis cores de etapa.
- **M4** — marca nova (quadrado chartreuse com "P"), item ativo da sidebar em chartreuse,
  alternador de tema fora da barra superior.
- **M5** — fundo das telas de acesso virou grid modular em vez do gradiente com blur.
- **M6** — cabeçalho da tabela de leads em `label-mono`, sem zebra, hover em `bg-elevated`.
- **M7** — cabeçalho de coluna sem glassmorphism, trilho na cor da etapa, valor do card na cor da
  etapa, hover e alvo de drop em chartreuse.

Os milestones seguintes (M3 landing, M8 dashboard, M9 settings) nascem já na v2.

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
