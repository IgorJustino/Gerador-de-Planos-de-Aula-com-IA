DROP TRIGGER IF EXISTS trigger_log_plano_criacao ON public.planos_aula;
DROP FUNCTION IF EXISTS log_plano_criacao();

COMMENT ON TABLE public.historico_geracoes IS 
  'Log de gerações de planos. O insert é feito manualmente pelo backend após validar o sucesso.';

CREATE OR REPLACE FUNCTION validar_plano_antes_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF LENGTH(TRIM(NEW.tema)) = 0 THEN
    RAISE EXCEPTION 'Tema não pode estar vazio';
  END IF;
  
  IF NEW.duracao_minutos < 10 OR NEW.duracao_minutos > 240 THEN
    RAISE EXCEPTION 'Duração deve estar entre 10 e 240 minutos';
  END IF;
  
  IF LENGTH(TRIM(NEW.introducao_ludica)) < 20 THEN
    RAISE EXCEPTION 'Introdução lúdica muito curta (mínimo 20 caracteres)';
  END IF;
  
  IF LENGTH(TRIM(NEW.objetivo_aprendizagem)) < 15 THEN
    RAISE EXCEPTION 'Objetivo de aprendizagem muito curto (mínimo 15 caracteres)';
  END IF;
  
  IF LENGTH(TRIM(NEW.passo_a_passo)) < 30 THEN
    RAISE EXCEPTION 'Passo a passo muito curto (mínimo 30 caracteres)';
  END IF;
  
  IF LENGTH(TRIM(NEW.rubrica_avaliacao)) < 20 THEN
    RAISE EXCEPTION 'Rubrica de avaliação muito curta (mínimo 20 caracteres)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_plano_antes_insert() IS 
  'Valida dados mínimos antes de inserir plano. Requisitos flexíveis para aceitar diferentes estilos de IA.';

CREATE INDEX IF NOT EXISTS idx_usuarios_email_lower 
  ON public.usuarios(LOWER(email));

COMMENT ON INDEX idx_usuarios_email_lower IS 
  'Índice case-insensitive para busca por email (melhora login)';

DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios;

CREATE POLICY "usuarios_insert_policy"
  ON public.usuarios
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    auth.jwt()->>'email' = email OR auth.jwt() IS NULL
  );

COMMENT ON POLICY "usuarios_insert_policy" ON public.usuarios IS 
  'Permite auto-registro de usuários autenticados ou criação inicial';

ANALYZE public.planos_aula;
ANALYZE public.usuarios;
ANALYZE public.historico_geracoes;
