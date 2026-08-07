-- ============================================================
-- REAA - schema inicial
-- Rode este arquivo inteiro no SQL Editor do projeto Supabase do REAA.
-- ============================================================

-- ------------------------------------------------------------
-- PERFIS
-- Uma linha por usuario do Supabase Auth: quem e a pessoa, se e
-- administrador e a que areas do sistema ela tem acesso.
-- ------------------------------------------------------------
create table if not exists public.perfis (
  user_id           uuid primary key references auth.users on delete cascade,
  nome              text        not null default '',
  papel             text        not null default 'membro' check (papel in ('admin', 'membro')),
  acesso_simbolica  boolean     not null default false,
  acesso_superiores boolean     not null default false,
  created_at        timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- SECURITY DEFINER: roda com privilegios do dono da funcao (ignora RLS).
-- Sem isso a policy de perfis consultaria perfis dentro de si mesma e o
-- Postgres devolveria "infinite recursion detected in policy for relation".
create or replace function public.e_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfis
    where user_id = auth.uid() and papel = 'admin'
  );
$$;

-- Porteiro das areas. As tabelas de conteudo (que virao depois) devem
-- chamar esta funcao nas suas policies em vez de repetir a regra.
create or replace function public.tem_acesso(area text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfis p
    where p.user_id = auth.uid()
      and (
        p.papel = 'admin'
        or (area = 'simbolica'  and p.acesso_simbolica)
        or (area = 'superiores' and p.acesso_superiores)
      )
  );
$$;

drop policy if exists "perfis_self_read"    on public.perfis;
drop policy if exists "perfis_admin_manage" on public.perfis;

-- Cada um le o proprio perfil (e assim descobre suas areas sem service key).
create policy "perfis_self_read" on public.perfis
  for select using (auth.uid() = user_id);

-- Admin le e escreve tudo.
create policy "perfis_admin_manage" on public.perfis
  for all using (public.e_admin()) with check (public.e_admin());

-- Todo usuario criado no Auth ganha um perfil sem acesso a nada. Liberar
-- area e um gesto deliberado do administrador, nao o padrao.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (user_id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- PRIMEIRO ADMINISTRADOR
-- ------------------------------------------------------------
-- Crie seu usuario em Authentication -> Users (Add user), depois rode a
-- linha abaixo trocando o e-mail. Sem isso ninguem consegue administrar,
-- porque o cadastro de usuarios do sistema exige papel 'admin'.
--
-- update public.perfis
--    set papel = 'admin', acesso_simbolica = true, acesso_superiores = true
--  where user_id = (select id from auth.users where email = 'voce@exemplo.com');
-- ============================================================


-- ============================================================
-- MODELO PARA AS TABELAS DE CONTEUDO
-- ------------------------------------------------------------
-- Toda tabela nova nasce com RLS ligada e amarrada a uma area. O padrao
-- abaixo vale tanto para a Simbolica quanto para os Superiores - so muda
-- o argumento de tem_acesso().
--
-- create table public.sessoes_simbolica (
--   id         uuid primary key default gen_random_uuid(),
--   data       date not null,
--   descricao  text not null,
--   created_at timestamptz not null default now()
-- );
--
-- alter table public.sessoes_simbolica enable row level security;
--
-- create policy "simbolica_leitura" on public.sessoes_simbolica
--   for select using (public.tem_acesso('simbolica'));
--
-- create policy "simbolica_escrita" on public.sessoes_simbolica
--   for all using (public.e_admin()) with check (public.e_admin());
-- ============================================================
