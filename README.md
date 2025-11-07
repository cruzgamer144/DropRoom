# DropRoom

Experiência premium de reservas de sneakers com acesso por convite. MVP construído com Next.js, TailwindCSS, Framer Motion e Supabase.

## Stack

- [Next.js 13](https://nextjs.org/) (Pages Router)
- [Tailwind CSS](https://tailwindcss.com/) com design minimalista premium
- [Framer Motion](https://www.framer.com/motion/) para animações discretas
- [Supabase](https://supabase.com/) para autenticação por Magic Link, gestão de convites e dados
- [react-hot-toast](https://react-hot-toast.com/) para feedback instantâneo

## Configuração

1. Instala dependências:

```bash
npm install
```

2. Cria um ficheiro `.env.local` com as seguintes variáveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=... # URL do teu projecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # Chave anon pública
SUPABASE_SERVICE_ROLE_KEY=... # Chave service role (para APIs protegidas)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ A chave `SUPABASE_SERVICE_ROLE_KEY` é utilizada exclusivamente nas rotas API (servidor) para validar convites e aplicar regras de negócio. Mantém esta chave segura e nunca a expõe no cliente.

3. Executa o servidor de desenvolvimento:

```bash
npm run dev
```

O site estará disponível em `http://localhost:3000`.

## Deploy na Vercel

- Configura as mesmas variáveis de ambiente no painel da Vercel.
- Utiliza o comando padrão `npm run build` para gerar o projecto.

## Estrutura principal

```
/pages          -> Páginas públicas e autenticadas
/pages/api      -> Endpoints serverless para convites, reservas e dados
/components     -> UI reutilizável (botões, cards, progress bar, etc.)
/lib            -> Utilitários (Supabase admin, helpers de token, tipos, datas)
/styles         -> Tailwind + estilos globais
/supabase       -> Esquema SQL e seed de exemplo
/data           -> Dados de exemplo para fallback local
```

## Esquema de Base de Dados

Consulta `supabase/schema.sql` para as tabelas, relações e políticas de segurança necessárias (invites, profiles, drops, reservations). O ficheiro `supabase/seed.sql` inclui dados iniciais para convites e drops de demonstração.

## Fluxos principais

- **Login com convite:** `/login` valida o código e envia Magic Link. `/auth/callback` associa o convite ao utilizador autenticado.
- **Dashboard privado:** `/dashboard` mostra limite mensal, reservas e permite reservar novos drops (respeitando o limite de 3/mês).
- **Calendário premium:** `/proximos-drops` apresenta próximos lançamentos com detalhe e CTA para reservar prioridade.

## Acessibilidade & UX

- Todos os elementos interactivos têm foco visível e texto alternativo.
- Cards e botões utilizam animações suaves com Framer Motion.
- Barras de progresso e mensagens de feedback orientam o utilizador.

## Próximos passos

- Ligar pagamentos (Stripe) nas reservas confirmadas.
- Criar área `/admin` para gestão de convites e drops.
- Automatizar reset mensal via cron job (Supabase Edge Functions ou Vercel Cron).
