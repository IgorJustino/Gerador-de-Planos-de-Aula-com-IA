-- Função que retorna o UUID do usuário da tabela usuarios baseado no email do JWT
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.usuarios WHERE email = auth.jwt()->>'email' LIMIT 1;
$$;

-- Tabela usuarios
DROP POLICY IF EXISTS "Usuários autenticados podem ler usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir registro público" ON public.usuarios;

-- Tabela planos_aula
DROP POLICY IF EXISTS "Usuários autenticados veem seus planos" ON public.planos_aula;
DROP POLICY IF EXISTS "Usuários autenticados criam planos" ON public.planos_aula;
DROP POLICY IF EXISTS "Usuários autenticados atualizam seus planos" ON public.planos_aula;
DROP POLICY IF EXISTS "Usuários autenticados deletam seus planos" ON public.planos_aula;

-- Tabela historico_geracoes
DROP POLICY IF EXISTS "Usuários autenticados veem seu histórico" ON public.historico_geracoes;
DROP POLICY IF EXISTS "Usuários autenticados criam histórico" ON public.historico_geracoes;

-- USUARIOS: Leitura para todos autenticados
CREATE POLICY "usuarios_select_policy"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- USUARIOS: Atualizar apenas seus dados
CREATE POLICY "usuarios_update_policy"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (id = public.get_current_user_id());

-- USUARIOS: Inserção durante registro
CREATE POLICY "usuarios_insert_policy"
  ON public.usuarios
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- PLANOS_AULA: Ver apenas seus planos
CREATE POLICY "planos_select_policy"
  ON public.planos_aula
  FOR SELECT
  TO authenticated
  CREATE OR REPLACE FUNCTION public.get_current_user_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE SECURITY DEFINER
  AS $$
    SELECT id FROM public.usuarios WHERE email = auth.jwt()->>'email' LIMIT 1;
  $$;

  DROP POLICY IF EXISTS "Usuários autenticados podem ler usuarios" ON public.usuarios;
  DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios;
  DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON public.usuarios;
  DROP POLICY IF EXISTS "Permitir registro público" ON public.usuarios;

  DROP POLICY IF EXISTS "Usuários autenticados veem seus planos" ON public.planos_aula;
  DROP POLICY IF EXISTS "Usuários autenticados criam planos" ON public.planos_aula;
  DROP POLICY IF EXISTS "Usuários autenticados atualizam seus planos" ON public.planos_aula;
  DROP POLICY IF EXISTS "Usuários autenticados deletam seus planos" ON public.planos_aula;

  DROP POLICY IF EXISTS "Usuários autenticados veem seu histórico" ON public.historico_geracoes;
  DROP POLICY IF EXISTS "Usuários autenticados criam histórico" ON public.historico_geracoes;

  CREATE POLICY "usuarios_select_policy"
    ON public.usuarios
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "usuarios_update_policy"
    ON public.usuarios
    FOR UPDATE
    TO authenticated
    USING (id = public.get_current_user_id());

  CREATE POLICY "usuarios_insert_policy"
    ON public.usuarios
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

  CREATE POLICY "planos_select_policy"
    ON public.planos_aula
    FOR SELECT
    TO authenticated
    USING (usuario_id = public.get_current_user_id());

  CREATE POLICY "planos_insert_policy"
    ON public.planos_aula
    FOR INSERT
    TO authenticated
    WITH CHECK (usuario_id = public.get_current_user_id());

  CREATE POLICY "planos_update_policy"
    ON public.planos_aula
    FOR UPDATE
    TO authenticated
    USING (usuario_id = public.get_current_user_id());

  CREATE POLICY "planos_delete_policy"
    ON public.planos_aula
    FOR DELETE
    TO authenticated
    USING (usuario_id = public.get_current_user_id());

  CREATE POLICY "historico_select_policy"
    ON public.historico_geracoes
    FOR SELECT
    TO authenticated
    USING (usuario_id = public.get_current_user_id());

  CREATE POLICY "historico_insert_policy"
    ON public.historico_geracoes
    FOR INSERT
    TO authenticated
    WITH CHECK (usuario_id = public.get_current_user_id());

  GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated, anon;

  GRANT SELECT, INSERT, UPDATE ON public.usuarios TO authenticated, anon;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.planos_aula TO authenticated;
  GRANT SELECT, INSERT ON public.historico_geracoes TO authenticated;
