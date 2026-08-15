# REAA — notas para quem mexe no código

Next.js 16 (App Router) + Supabase. Duas áreas — **Simbólica** e **Superiores** — que
convivem na mesma tela inicial, em dois blocos.

## Convenções

- Português nos nomes de rota, tabela, coluna e variável de domínio (`perfis`, `papel`,
  `acesso_simbolica`). Inglês só onde o framework impõe (`page.tsx`, `layout.tsx`).
- Sem acento em comentário de código; com acento em tudo que o usuário lê.
- Componentes de UI ficam em `components/ui` e são genéricos. Nada de regra de negócio lá.

## Regras que não podem ser afrouxadas

- **`lib/secoes.ts` é a fonte da tela inicial.** Tela nova entra como item de `modulos`,
  não como JSX solto em `app/(app)/page.tsx`.
- **Toda tabela nova nasce com RLS ligada**, com policy chamando `public.tem_acesso('simbolica')`
  ou `public.tem_acesso('superiores')`. O modelo está comentado no fim de `supabase/schema.sql`.
  Permissão só na tela é permissão nenhuma.
- **`createAdminClient()` (service role) ignora RLS.** Só pode ser importado por código que
  roda no servidor — rotas `/api/admin`, depois de `exigirAdmin()`. Nunca de um `'use client'`.
- **O papel vem do banco**, nunca do corpo da requisição.
- **O assistente de IA lê pelo client de sessão** (`/api/geral/assistente`), nunca pela service
  role. Ele só enxerga o que a própria pessoa veria na tela, e a lista de tabelas que ele pode
  consultar sai de `lib/geral.ts` — o modelo escolhe entre opções, não escreve query.
- `NEXT_PUBLIC_*` são embutidas no bundle do navegador durante o build. Nenhum segredo
  pode usar esse prefixo.

## Deploy

`git push origin main` dispara tudo. O caminho e o diagnóstico de falhas estão em
[DEPLOY.md](DEPLOY.md). O `deploy.ps1` acompanha até confirmar que o site mudou.
