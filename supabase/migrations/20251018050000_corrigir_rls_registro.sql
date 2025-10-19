-- ========================================
-- CORREÇÃO: Permitir registro de novos usuários
-- ========================================

-- Remover políticas antigas
drop policy if exists usuarios_select_self on public.usuarios;
drop policy if exists usuarios_update_self on public.usuarios;
drop policy if exists usuarios_insert_self on public.usuarios;

-- Política: Usuários podem ver seus próprios dados
create policy usuarios_select_own on public.usuarios
  for select
  using (
    auth.uid() = id OR 
    auth.jwt()->>'email' = email
  );

-- Política: Usuários podem atualizar seus próprios dados
create policy usuarios_update_own on public.usuarios
  for update
  using (auth.uid() = id);

-- Política: Permitir inserção durante registro (SEM restrição de auth.uid())
create policy usuarios_insert_public on public.usuarios
  for insert
  with check (true);

-- Garantir que RLS está ativado
alter table public.usuarios enable row level security;
