# DropRoom

DropRoom é uma loja privada de sneakers premium construída com Next.js 14 (App Router). A escolha do App Router permite utilizar Server Components, Server Actions e layouts aninhados — essenciais para separar claramente áreas públicas, autenticadas e administrativas sem duplicação de lógica.

## Stack

- **Next.js 14 (App Router)** – Renderização híbrida, Server Actions para integrações seguras com Supabase e Stripe.
- **TailwindCSS** – Estilo rápido com tema minimalista e acentos dourados.
- **Framer Motion** – Animações discretas (fade/slide/hover com reflexo).
- **Supabase** – Auth via Magic Link, base de dados Postgres, policies RLS e storage.
- **Stripe (opcional)** – Endpoint preparado para sessões de checkout.
- **Resend (opcional)** – Pode ser integrado nos Server Actions de convite.
- **React Query** – Query client partilhado no cliente.
- **Jest + Testing Library** – Testes unitários.
- **Playwright** – Testes E2E headless.
- **GitHub Actions + Vercel** – CI/CD automático (workflow incluído em `.github/workflows`).

## Estrutura

```
src/
  app/
    (marketing)            # Landing, próximos drops e detalhe
    (auth)                 # Login e callback
    (protected)/dashboard  # Área do membro
    (protected)/eletronicos  # Catálogo premium de dispositivos
    (admin)/admin          # Painel administrativo
    api/checkout           # Endpoint Stripe (modo teste)
  components/              # UI, landing, dashboard e admin
  lib/                     # Supabase client, queries e server actions
  types/                   # Tipos de domínio
  __tests__/               # Unit tests
supabase/
  migrations/              # SQL para estrutura + RLS + funções
  seeds/                   # Seeds base
  scripts/                 # Runner Node para migrações e seeds
```

## Pré-requisitos

- Node.js 18+
- Conta Supabase com projecto configurado
- (Opcional) Conta Stripe modo teste
- (Opcional) Conta Resend ou semelhante

## Configuração do Supabase

1. **Variáveis obrigatórias** no Supabase → Authentication → URL de Redirect:
   - `http://localhost:3000/auth/callback`
   - `https://<dominio-vercel>/auth/callback`

2. **Executar migrações e seeds** (necessário `SUPABASE_DB_URL`, disponível em *Settings → Database → Connection string*):

```bash
export SUPABASE_DB_URL="postgres://postgres:senha@host:5432/postgres"
npm run migrate
npm run seed
```

3. **Configurar políticas RLS** – já incluídas nas migrações:
   - Perfis sincronizados via `use_invite_and_sync_profile`
   - Convites com leitura pública, escrita apenas admin
   - Reservas protegidas pela função `create_reservation_with_limit` que aplica o limite mensal
   - Catálogo de eletrónicos protegido pela função `create_electronics_order_with_limit`, com contagem independente
   - Admin determinado pelo campo `role` do perfil (definido nas seeds ou manualmente)

4. **Chaves Supabase** – adicionar a `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Ambiente local

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

### Scripts úteis

- `npm run dev` – modo desenvolvimento
- `npm run build` / `npm start` – produção
- `npm run lint` – ESLint
- `npm run test` – Jest (unitário)
- `npm run test:e2e` – Playwright (necessita variáveis de sessão configuradas)
- `npm run migrate` – corre todas as migrações SQL
- `npm run seed` – aplica seeds base

## Testes

### Unitários

Cobrem componentes críticos (`CardDrop`, `ReservationForm`, `ProgressBar`, `ElectronicsPageView`).

```bash
npm run test
```

### E2E (Playwright)

Os testes e2e estão preparados para funcionar com tokens reais. Para ativá-los defina:

```
PLAYWRIGHT_BASE_URL=http://localhost:3000
E2E_INVITE_CODE=<convite ativo>
E2E_MEMBER_EMAIL=<email membro>
E2E_SESSION_TOKEN=<token de sessão do membro>
E2E_REFRESH_TOKEN=<refresh token>
E2E_ADMIN_ACCESS=<token admin>
E2E_ADMIN_REFRESH=<refresh admin>
```

Sem estas variáveis os testes são automaticamente ignorados (marcados com `skip`).

```bash
npm run test:e2e
```

## Deploy na Vercel

1. Definir variáveis no projecto Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ex: `https://droproom.vercel.app`)
   - `STRIPE_SECRET_KEY` (opcional, modo teste)
   - `RESEND_API_KEY` (opcional)

2. Ligar o repositório GitHub à Vercel. Cada push em `main` cria deploy automático (workflow GitHub Actions garante lint + testes).

## Stripe e Emails

- O endpoint `/api/checkout` espera `lineItems`, `successUrl`, `cancelUrl` e usa `STRIPE_SECRET_KEY` em modo teste.
- Para emails transacionais (convites personalizados) podes integrar o Resend dentro das server actions (variável `RESEND_API_KEY`).

## Segurança & RLS

- Nenhuma chave de service role é exposta no cliente – apenas em Server Actions/API Routes.
- Policies impedem leitura/escrita indevida:
  - Membros só acedem ao próprio perfil e reservas.
  - Admin tem permissões elevadas via função `is_admin()`.
  - Convites podem ser lidos publicamente para validação, mas criados/atualizados apenas por admin.
  - Reservas passam por função `create_reservation_with_limit` que valida limite mensal e atualiza contagem.

## Seeds iniciais

- 3 drops de exemplo.
- 2 convites ativos (`DROP-GOLD01`, `DROP-GOLD02`).
- Catálogo base de eletrónicos (AirPods, Beats, etc.) com estados variados.

## Acessibilidade & UX

- Imagens com `alt` descritivo.
- Foco visível em inputs/botões.
- Estados vazios amigáveis e toasts para feedback.
- Tema premium minimalista com acentos dourados (`#E6C200`).

## CI/CD

- Workflow GitHub Actions (ver `.github/workflows/ci.yml`) executa `lint`, `test` e `test:e2e` antes de permitir o build/deploy.
- Vercel cuida do deploy contínuo após sucesso do CI.

Aproveita o DropRoom! ✨
