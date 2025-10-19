-- REMOVETRIGGER QUE DUPLICA HISTÓRICO

DROP TRIGGER IF EXISTS trigger_log_plano_criacao ON public.planos_aula;
DROP FUNCTION IF EXISTS log_plano_criacao();

COMMENT ON TABLE public.historico_geracoes IS 
  'Log de gerações de planos. O insert é feito manualmente pelo backend após validar o sucesso.';

-- Substituir função de validação por versão menos restritiva
CREATE OR REPLACE FUNCTION validar_plano_antes_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que o tema não está vazio
  IF LENGTH(TRIM(NEW.tema)) = 0 THEN
    RAISE EXCEPTION 'Tema não pode estar vazio';
  END IF;
  
  -- Validar duração razoável (entre 10 e 240 minutos) - MAIS FLEXÍVEL
  IF NEW.duracao_minutos < 10 OR NEW.duracao_minutos > 240 THEN
    RAISE EXCEPTION 'Duração deve estar entre 10 e 240 minutos';
  END IF;
  
  -- Validar que as 4 seções obrigatórias existem (mínimos reduzidos)
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

-- Melhorar performance na busca de usuário por email durante login
CREATE INDEX IF NOT EXISTS idx_usuarios_email_lower 
  ON public.usuarios(LOWER(email));

COMMENT ON INDEX idx_usuarios_email_lower IS 
  'Índice case-insensitive para busca por email (melhora login)';

-- Garantir que usuários podem se auto-registrar na tabela usuarios
DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios;

CREATE POLICY "usuarios_insert_policy"
  ON public.usuarios
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    -- Permitir insert se:
    -- 1. Email do JWT == email sendo inserido (auto-registro após signUp)
    -- 2. OU ainda não autenticado (registro inicial)
    auth.jwt()->>'email' = email OR auth.jwt() IS NULL
  );

COMMENT ON POLICY "usuarios_insert_policy" ON public.usuarios IS 
  'Permite auto-registro de usuários autenticados ou criação inicial';

-- Reanalyze
ANALYZE public.planos_aula;
ANALYZE public.usuarios;
ANALYZE public.historico_geracoes;
