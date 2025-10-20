-- Cria tabela public.usuarios
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  papel text default 'professor' check (papel in ('professor', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_usuarios_email on public.usuarios(email);

-- Cria tabela public.planos_aula
create table if not exists public.planos_aula (
  id bigint primary key generated always as identity,
  usuario_id uuid references public.usuarios(id) on delete cascade,
  tema text not null,
  disciplina text,
  nivel_ensino text not null check (nivel_ensino in (
    'Educação Infantil',
    'Ensino Fundamental I',
    'Ensino Fundamental II',
    'Ensino Médio'
  )),
  duracao_minutos integer not null default 50 check (duracao_minutos > 0),
  codigo_bncc text check (codigo_bncc ~ '^[A-Z]{2}\d{2}[A-Z]{2}\d{2}$'),
  observacoes text,
  introducao_ludica text not null,
  objetivo_aprendizagem text not null,
  passo_a_passo text not null,
  rubrica_avaliacao text not null,
  modelo_gemini_usado text default 'gemini-2.5-flash',
  tokens_utilizados integer,
  tempo_geracao_ms integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_planos_usuario_id on public.planos_aula(usuario_id);
create index if not exists idx_planos_created_at on public.planos_aula(created_at desc);
create index if not exists idx_planos_nivel_ensino on public.planos_aula(nivel_ensino);

-- Cria tabela public.historico_geracoes
create table if not exists public.historico_geracoes (
  id bigint primary key generated always as identity,
  usuario_id uuid references public.usuarios(id) on delete cascade,
  plano_id bigint references public.planos_aula(id) on delete set null,
  input_json jsonb not null,
  modelo_usado text not null,
  status text not null check (status in ('sucesso', 'erro')),
  mensagem_erro text,
  tempo_execucao_ms integer,
  created_at timestamptz default now()
);

create index if not exists idx_historico_usuario_id on public.historico_geracoes(usuario_id);
create index if not exists idx_historico_status on public.historico_geracoes(status);

-- Função para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers de updated_at
drop trigger if exists update_usuarios_updated_at on public.usuarios;
create trigger update_usuarios_updated_at
  before update on public.usuarios
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_planos_updated_at on public.planos_aula;
create trigger update_planos_updated_at
  before update on public.planos_aula
  for each row
  execute function update_updated_at_column();

-- Habilitar RLS
alter table public.usuarios enable row level security;
alter table public.planos_aula enable row level security;
alter table public.historico_geracoes enable row level security;

-- Políticas RLS essenciais
-- Permitir que usuários leiam/atualizem-seu registro na tabela usuarios
drop policy if exists usuarios_select_self on public.usuarios;
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  papel text default 'professor' check (papel in ('professor', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_usuarios_email on public.usuarios(email);

create table if not exists public.planos_aula (
  id bigint primary key generated always as identity,
  usuario_id uuid references public.usuarios(id) on delete cascade,
  tema text not null,
  disciplina text,
  nivel_ensino text not null check (nivel_ensino in (
    'Educação Infantil',
    'Ensino Fundamental I',
    'Ensino Fundamental II',
    'Ensino Médio'
  )),
  duracao_minutos integer not null default 50 check (duracao_minutos > 0),
  codigo_bncc text check (codigo_bncc ~ '^[A-Z]{2}\d{2}[A-Z]{2}\d{2}$'),
  observacoes text,
  introducao_ludica text not null,
  objetivo_aprendizagem text not null,
  passo_a_passo text not null,
  rubrica_avaliacao text not null,
  modelo_gemini_usado text default 'gemini-2.5-flash',
  tokens_utilizados integer,
  tempo_geracao_ms integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_planos_usuario_id on public.planos_aula(usuario_id);
create index if not exists idx_planos_created_at on public.planos_aula(created_at desc);
create index if not exists idx_planos_nivel_ensino on public.planos_aula(nivel_ensino);

create table if not exists public.historico_geracoes (
  id bigint primary key generated always as identity,
  usuario_id uuid references public.usuarios(id) on delete cascade,
  plano_id bigint references public.planos_aula(id) on delete set null,
  input_json jsonb not null,
  modelo_usado text not null,
  status text not null check (status in ('sucesso', 'erro')),
  mensagem_erro text,
  tempo_execucao_ms integer,
  created_at timestamptz default now()
);

create index if not exists idx_historico_usuario_id on public.historico_geracoes(usuario_id);
create index if not exists idx_historico_status on public.historico_geracoes(status);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_usuarios_updated_at on public.usuarios;
create trigger update_usuarios_updated_at
  before update on public.usuarios
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_planos_updated_at on public.planos_aula;
create trigger update_planos_updated_at
  before update on public.planos_aula
  for each row
  execute function update_updated_at_column();

alter table public.usuarios enable row level security;
alter table public.planos_aula enable row level security;
alter table public.historico_geracoes enable row level security;

drop policy if exists usuarios_select_self on public.usuarios;
create policy usuarios_select_self on public.usuarios
  for select
  using (auth.uid() = id);

drop policy if exists usuarios_update_self on public.usuarios;
create policy usuarios_update_self on public.usuarios
  for update
  using (auth.uid() = id);

drop policy if exists usuarios_insert_self on public.usuarios;
create policy usuarios_insert_self on public.usuarios
  for insert
  with check (true);

drop policy if exists planos_select_own on public.planos_aula;
create policy planos_select_own on public.planos_aula
  for select
  using (auth.uid() = usuario_id);

drop policy if exists planos_insert_own on public.planos_aula;
create policy planos_insert_own on public.planos_aula
  for insert
  with check (auth.uid() = usuario_id);

drop policy if exists planos_delete_own on public.planos_aula;
create policy planos_delete_own on public.planos_aula
  for delete
  using (auth.uid() = usuario_id);

drop policy if exists historico_select_own on public.historico_geracoes;
create policy historico_select_own on public.historico_geracoes
  for select
  using (auth.uid() = usuario_id);

drop policy if exists historico_insert_own on public.historico_geracoes;
create policy historico_insert_own on public.historico_geracoes
  for insert
  with check (auth.uid() = usuario_id);

comment on table public.usuarios is 'Tabela de usuários do sistema (professores e admins)';
comment on table public.planos_aula is 'Planos de aula gerados pela IA Gemini';
comment on table public.historico_geracoes is 'Log completo de todas as gerações de planos';

comment on column public.planos_aula.disciplina is 'Disciplina da aula (ex: Matemática, Ciências, História)';
comment on column public.planos_aula.codigo_bncc is 'Código da habilidade BNCC (ex: EF05MA01) - validado com regex';
comment on column public.planos_aula.introducao_ludica is 'Texto criativo e engajante gerado pela IA';
comment on column public.planos_aula.objetivo_aprendizagem is 'Objetivo alinhado à BNCC';
comment on column public.planos_aula.passo_a_passo is 'Roteiro completo da aula';
comment on column public.planos_aula.rubrica_avaliacao is 'Critérios de avaliação do aprendizado';
