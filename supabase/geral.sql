-- ============================================================
-- REAA - area Geral (Parametros e Formularios)
-- Rode este arquivo inteiro no SQL Editor do projeto Supabase do REAA,
-- depois de ja ter rodado schema.sql (usa as funcoes e_admin() de la).
-- ============================================================

-- ------------------------------------------------------------
-- PARAMETROS: listas de referencia usadas pelos formularios.
-- ------------------------------------------------------------
create table if not exists public.cargos (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  ordem      integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.corpos (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  ordem      integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.agendas (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  ordem      integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.graus (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  ordem      integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FORMULARIOS: telas de cadastro. FKs apontam para os parametros
-- acima (ou para obreiros, no caso de Eventos).
-- ------------------------------------------------------------
create table if not exists public.obreiros (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  cargo_id   uuid references public.cargos(id) on delete set null,
  corpo_id   uuid references public.corpos(id) on delete set null,
  matricula  integer,
  ano        integer,
  created_at timestamptz not null default now()
);

-- "create table if not exists" nao altera tabela ja criada: para quem rodou
-- este arquivo antes de corpo_id existir, a coluna entra por aqui.
alter table public.obreiros
  add column if not exists corpo_id uuid references public.corpos(id) on delete set null;

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  titulo     text not null,
  grau_id    uuid references public.graus(id) on delete set null,
  corpo_id   uuid references public.corpos(id) on delete set null,
  texto      text,
  created_at timestamptz not null default now()
);

-- Mesmo caso de obreiros.corpo_id: quem ja tinha a tabela criada recebe as
-- colunas por aqui.
alter table public.notes
  add column if not exists grau_id uuid references public.graus(id) on delete set null;
alter table public.notes
  add column if not exists corpo_id uuid references public.corpos(id) on delete set null;

create table if not exists public.eventos (
  id         uuid primary key default gen_random_uuid(),
  agenda_id  uuid references public.agendas(id) on delete set null,
  data       date,
  obreiro_id uuid references public.obreiros(id) on delete set null,
  grau_id    uuid references public.graus(id) on delete set null,
  impressoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.cobridores (
  id         uuid primary key default gen_random_uuid(),
  sinal      text,
  alegorias  text,
  -- `simbolos` saiu do formulario, mas a coluna fica: apagar levaria junto o
  -- que ja foi cadastrado. Ver o campo Grau que entrou no lugar dela.
  simbolos   text,
  grau_id    uuid references public.graus(id) on delete set null,
  idade      integer,
  passos     text,
  marcha     text,
  toques     text,
  outro      text,
  created_at timestamptz not null default now()
);

alter table public.cobridores
  add column if not exists marcha text;
alter table public.cobridores
  add column if not exists grau_id uuid references public.graus(id) on delete set null;

create table if not exists public.resumos (
  id                 uuid primary key default gen_random_uuid(),
  grau_id            uuid references public.graus(id) on delete set null,
  alegorias          text,
  simbolos           text,
  juramento          text,
  moral              text,
  personagens        text,
  livro_da_lei       text,
  contexto_historico text,
  created_at         timestamptz not null default now()
);

-- "create table if not exists" nao altera tabela ja criada: para quem rodou
-- este arquivo antes destas colunas existirem, elas entram por aqui.
alter table public.resumos
  add column if not exists grau_id uuid references public.graus(id) on delete set null;
alter table public.resumos
  add column if not exists livro_da_lei text;

-- ------------------------------------------------------------
-- RLS: qualquer pessoa logada le; so admin cria, edita ou exclui.
-- Mesmo padrao de perfis_self_read / perfis_admin_manage.
-- ------------------------------------------------------------
do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'cargos', 'corpos', 'agendas', 'graus',
    'obreiros', 'notes', 'eventos', 'cobridores', 'resumos'
  ]
  loop
    execute format('alter table public.%I enable row level security', tabela);
    execute format('drop policy if exists "%s_leitura" on public.%I', tabela, tabela);
    execute format('drop policy if exists "%s_admin_escreve" on public.%I', tabela, tabela);
    execute format(
      'create policy "%s_leitura" on public.%I for select using (auth.uid() is not null)',
      tabela, tabela
    );
    execute format(
      'create policy "%s_admin_escreve" on public.%I for all using (public.e_admin()) with check (public.e_admin())',
      tabela, tabela
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- SEED: valores da planilha "base reaa sistema.xlsx" (colunas LISTA).
-- ------------------------------------------------------------
insert into public.cargos (nome, ordem) values
  ('Presidente', 1),
  ('1. Vig.', 2),
  ('2. Vig.', 3),
  ('Secretario', 4),
  ('Orador', 5),
  ('Tesoureiro', 6),
  ('Comissão de Grau', 7),
  ('Obreiro', 8)
on conflict (nome) do nothing;

insert into public.corpos (nome, ordem) values
  ('TAR 100', 1),
  ('ELP Cavaleiros Chave de Marfim', 2),
  ('ELP José Carvalho', 3),
  ('SCRC Leopoldo Jorge Cardon', 4)
on conflict (nome) do nothing;

insert into public.agendas (nome, ordem) values
  ('Iniciação', 1),
  ('Apres. Trabalho', 2),
  ('Reflexão', 3),
  ('Reunião', 4),
  ('Seminário', 5),
  ('Posse', 6)
on conflict (nome) do nothing;

insert into public.graus (nome, ordem)
select nome, ordem from (values
  ('Perfeição', 1), ('Capítulo', 2), ('Kadosh', 3), ('Consistório', 4),
  ('Inspetoria', 5), ('Del.Lit.', 6), ('Superiores', 7), ('Simbólica', 8),
  ('1', 9), ('2', 10), ('3', 11), ('4', 12), ('5', 13), ('6', 14), ('7', 15),
  ('8', 16), ('9', 17), ('10', 18), ('11', 19), ('12', 20), ('13', 21), ('14', 22),
  ('15', 23), ('16', 24), ('17', 25), ('18', 26), ('19', 27), ('20', 28), ('21', 29),
  ('22', 30), ('23', 31), ('24', 32), ('25', 33), ('26', 34), ('27', 35), ('28', 36),
  ('29', 37), ('30', 38), ('31', 39), ('32', 40), ('33', 41)
) as v(nome, ordem)
on conflict (nome) do nothing;
