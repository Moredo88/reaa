# REAA

Sistema do Rito Escocês Antigo e Aceito. Uma tela inicial, dividida em dois blocos:
**Simbólica** e **Superiores**.

Next.js 16 (App Router) + Supabase (Postgres, Auth e RLS). Deploy em container próprio —
o caminho inteiro está em [DEPLOY.md](DEPLOY.md).

## Como está organizado

```
app/
  (app)/                    tudo aqui exige sessão
    layout.tsx              cabeçalho + guarda de sessão
    page.tsx                tela inicial: os dois blocos
    admin/usuarios/         cadastro de quem entra e do que cada um vê
  api/admin/usuarios/       rotas que usam a service role key
  login/                    entrada por e-mail e senha
  auth/signout/             saída
components/
  home/BlocoSecao.tsx       o bloco (desenha uma seção qualquer)
  layout/Header.tsx
  ui/                       Button, Input, Select, Badge, EmptyState
lib/
  secoes.ts                 ► o conteúdo dos dois blocos sai daqui
  auth/permissions.ts       perfil do usuário e quem vê qual área
  auth/api.ts               portaria das rotas /api/admin
  supabase/                 clients (browser, server, admin) e sessão
supabase/schema.sql         tabelas, RLS e funções — rode no SQL Editor
```

## Acrescentar uma tela

As duas áreas são dirigidas por dados. Para publicar uma tela nova na Simbólica:

1. Acrescente um item em `modulos` da seção correspondente, em `lib/secoes.ts`:

   ```ts
   modulos: [
     { nome: 'Sessões', href: '/simbolica/sessoes', descricao: 'Agenda e presença' },
   ]
   ```

2. Crie a rota em `app/(app)/simbolica/sessoes/page.tsx`.
3. Se ela tiver tabela própria, siga o modelo comentado no fim de `supabase/schema.sql`:
   RLS ligada e policy chamando `public.tem_acesso('simbolica')`.

O bloco na tela inicial passa a listar a tela sozinho. Nada mais muda.

## Acesso

Três decisões, gravadas em `public.perfis`:

- `papel` — `admin` ou `membro`. Só admin abre `/admin/usuarios`.
- `acesso_simbolica` / `acesso_superiores` — qual bloco a pessoa enxerga.

Um bloco a que o membro não tem acesso não aparece: nem o conteúdo, nem o título.
Administradores veem os dois. Quem não tem nenhum dos dois entra e vê um aviso para
procurar um administrador — a regra vale também no banco, via RLS, não só na tela.

## Primeiro uso

1. Crie o projeto no Supabase e rode `supabase/schema.sql` no SQL Editor.
2. Crie seu usuário em **Authentication → Users**.
3. Promova-o a admin com o `update` comentado no fim do `schema.sql`.
4. Copie `.env.example` para `.env.local` e preencha as três chaves.
5. `npm install` e `npm run dev`.

Daí em diante, o cadastro dos demais usuários é feito pela própria tela `/admin/usuarios`.
