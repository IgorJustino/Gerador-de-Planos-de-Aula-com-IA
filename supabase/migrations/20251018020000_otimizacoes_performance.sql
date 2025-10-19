-- Índice composto para buscas por usuário + data (muito comum)
CREATE INDEX IF NOT EXISTS idx_planos_usuario_created 
  ON public.planos_aula(usuario_id, created_at DESC);

-- Índice para busca por disciplina (para filtros futuros)
CREATE INDEX IF NOT EXISTS idx_planos_disciplina 
  ON public.planos_aula(disciplina) 
  WHERE disciplina IS NOT NULL;

-- Índice para busca por código BNCC (pesquisas específicas)
CREATE INDEX IF NOT EXISTS idx_planos_codigo_bncc 
  ON public.planos_aula(codigo_bncc) 
  WHERE codigo_bncc IS NOT NULL;

-- Índice para busca textual no tema (usando GIN para busca full-text)
CREATE INDEX IF NOT EXISTS idx_planos_tema_gin 
  ON public.planos_aula USING gin(to_tsvector('portuguese', tema));

-- Índice para histórico por data (análises temporais)
CREATE INDEX IF NOT EXISTS idx_historico_created_at 
  ON public.historico_geracoes(created_at DESC);

-- Índice composto para análise de sucesso/erro por usuário
CREATE INDEX IF NOT EXISTS idx_historico_usuario_status 
  ON public.historico_geracoes(usuario_id, status, created_at DESC);

-- Trigger: Registrar automaticamente no histórico ao criar plano
CREATE OR REPLACE FUNCTION log_plano_criacao()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.historico_geracoes (
    usuario_id,
    plano_id,
    input_json,
    modelo_usado,
    status,
    tempo_execucao_ms,
    created_at
  ) VALUES (
    NEW.usuario_id,
    NEW.id,
    jsonb_build_object(
      'tema', NEW.tema,
      'disciplina', NEW.disciplina,
      'nivel_ensino', NEW.nivel_ensino,
      'duracao_minutos', NEW.duracao_minutos,
      'codigo_bncc', NEW.codigo_bncc
    ),
    NEW.modelo_gemini_usado,
    'sucesso',
    NEW.tempo_geracao_ms,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_plano_criacao
  AFTER INSERT ON public.planos_aula
  FOR EACH ROW
  EXECUTE FUNCTION log_plano_criacao();

-- Trigger: Prevenir deleção acidental de muitos planos de uma vez
CREATE OR REPLACE FUNCTION prevenir_delecao_em_massa()
RETURNS TRIGGER AS $$
DECLARE
  total_planos INTEGER;
BEGIN
  -- Conta quantos planos o usuário tem
  SELECT COUNT(*) INTO total_planos
  FROM public.planos_aula
  WHERE usuario_id = OLD.usuario_id;
  
  -- Se está deletando e o usuário tem mais de 10 planos, gera warning no log
  IF total_planos > 10 THEN
    RAISE NOTICE 'Usuário % está deletando plano. Total de planos: %', OLD.usuario_id, total_planos;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevenir_delecao_em_massa
  BEFORE DELETE ON public.planos_aula
  FOR EACH ROW
  EXECUTE FUNCTION prevenir_delecao_em_massa();

-- Trigger: Validar dados antes de inserir plano
CREATE OR REPLACE FUNCTION validar_plano_antes_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que o tema não está vazio
  IF LENGTH(TRIM(NEW.tema)) = 0 THEN
    RAISE EXCEPTION 'Tema não pode estar vazio';
  END IF;
  
  -- Validar duração razoável (entre 15 e 180 minutos)
  IF NEW.duracao_minutos < 15 OR NEW.duracao_minutos > 180 THEN
    RAISE EXCEPTION 'Duração deve estar entre 15 e 180 minutos';
  END IF;
  
  -- Validar que as 4 seções obrigatórias não estão vazias
  IF LENGTH(TRIM(NEW.introducao_ludica)) < 50 THEN
    RAISE EXCEPTION 'Introdução lúdica muito curta (mínimo 50 caracteres)';
  END IF;
  
  IF LENGTH(TRIM(NEW.objetivo_aprendizagem)) < 30 THEN
    RAISE EXCEPTION 'Objetivo de aprendizagem muito curto (mínimo 30 caracteres)';
  END IF;
  
  IF LENGTH(TRIM(NEW.passo_a_passo)) < 100 THEN
    RAISE EXCEPTION 'Passo a passo muito curto (mínimo 100 caracteres)';
  END IF;
  
  IF LENGTH(TRIM(NEW.rubrica_avaliacao)) < 50 THEN
    RAISE EXCEPTION 'Rubrica de avaliação muito curta (mínimo 50 caracteres)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_plano
  BEFORE INSERT ON public.planos_aula
  FOR EACH ROW
  EXECUTE FUNCTION validar_plano_antes_insert();

-- VIEWS ÚTEIS

-- View: Estatísticas por usuário
CREATE OR REPLACE VIEW public.v_estatisticas_usuario AS
SELECT 
  u.id AS usuario_id,
  u.nome,
  u.email,
  COUNT(DISTINCT p.id) AS total_planos,
  COUNT(DISTINCT p.disciplina) AS disciplinas_distintas,
  COUNT(DISTINCT p.nivel_ensino) AS niveis_ensino_distintos,
  AVG(p.tempo_geracao_ms)::INTEGER AS tempo_medio_geracao_ms,
  SUM(p.tokens_utilizados) AS tokens_totais,
  MIN(p.created_at) AS primeiro_plano_em,
  MAX(p.created_at) AS ultimo_plano_em,
  COUNT(DISTINCT DATE(p.created_at)) AS dias_ativos
FROM public.usuarios u
LEFT JOIN public.planos_aula p ON u.id = p.usuario_id
GROUP BY u.id, u.nome, u.email;

-- View: Planos recentes com informações do usuário
CREATE OR REPLACE VIEW public.v_planos_recentes AS
SELECT 
  p.id,
  p.tema,
  p.disciplina,
  p.nivel_ensino,
  p.duracao_minutos,
  p.codigo_bncc,
  p.modelo_gemini_usado,
  p.tempo_geracao_ms,
  p.created_at,
  u.nome AS usuario_nome,
  u.email AS usuario_email,
  LENGTH(p.introducao_ludica) + 
  LENGTH(p.objetivo_aprendizagem) + 
  LENGTH(p.passo_a_passo) + 
  LENGTH(p.rubrica_avaliacao) AS caracteres_totais
FROM public.planos_aula p
INNER JOIN public.usuarios u ON p.usuario_id = u.id
ORDER BY p.created_at DESC;

-- View: Análise de histórico (sucesso vs erro)
CREATE OR REPLACE VIEW public.v_analise_historico AS
SELECT 
  u.id AS usuario_id,
  u.nome,
  u.email,
  COUNT(*) AS total_tentativas,
  COUNT(*) FILTER (WHERE h.status = 'sucesso') AS tentativas_sucesso,
  COUNT(*) FILTER (WHERE h.status = 'erro') AS tentativas_erro,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE h.status = 'sucesso') / NULLIF(COUNT(*), 0), 
    2
  ) AS taxa_sucesso_percentual,
  AVG(h.tempo_execucao_ms) FILTER (WHERE h.status = 'sucesso')::INTEGER AS tempo_medio_sucesso_ms,
  AVG(h.tempo_execucao_ms) FILTER (WHERE h.status = 'erro')::INTEGER AS tempo_medio_erro_ms
FROM public.usuarios u
LEFT JOIN public.historico_geracoes h ON u.id = h.usuario_id
GROUP BY u.id, u.nome, u.email;

-- View: Ranking de disciplinas mais usadas
CREATE OR REPLACE VIEW public.v_ranking_disciplinas AS
SELECT 
  disciplina,
  COUNT(*) AS quantidade_planos,
  COUNT(DISTINCT usuario_id) AS usuarios_distintos,
  AVG(duracao_minutos)::INTEGER AS duracao_media_minutos,
  MAX(created_at) AS ultimo_uso
FROM public.planos_aula
WHERE disciplina IS NOT NULL
GROUP BY disciplina
ORDER BY quantidade_planos DESC;

-- View: Planos por nível de ensino
CREATE OR REPLACE VIEW public.v_distribuicao_nivel_ensino AS
SELECT 
  nivel_ensino,
  COUNT(*) AS quantidade_planos,
  COUNT(DISTINCT usuario_id) AS usuarios_distintos,
  AVG(duracao_minutos)::INTEGER AS duracao_media_minutos,
  COUNT(*) FILTER (WHERE codigo_bncc IS NOT NULL) AS com_codigo_bncc,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE codigo_bncc IS NOT NULL) / NULLIF(COUNT(*), 0),
    2
  ) AS percentual_com_bncc
FROM public.planos_aula
GROUP BY nivel_ensino
ORDER BY quantidade_planos DESC;

-- Função: Buscar planos por texto (full-text search)
CREATE OR REPLACE FUNCTION public.buscar_planos(termo TEXT)
RETURNS TABLE (
  id BIGINT,
  tema TEXT,
  disciplina TEXT,
  nivel_ensino TEXT,
  codigo_bncc TEXT,
  created_at TIMESTAMPTZ,
  relevancia REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.tema,
    p.disciplina,
    p.nivel_ensino,
    p.codigo_bncc,
    p.created_at,
    ts_rank(
      to_tsvector('portuguese', p.tema || ' ' || COALESCE(p.disciplina, '') || ' ' || COALESCE(p.observacoes, '')),
      plainto_tsquery('portuguese', termo)
    ) AS relevancia
  FROM public.planos_aula p
  WHERE to_tsvector('portuguese', p.tema || ' ' || COALESCE(p.disciplina, '') || ' ' || COALESCE(p.observacoes, ''))
        @@ plainto_tsquery('portuguese', termo)
  ORDER BY relevancia DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter estatísticas do sistema
CREATE OR REPLACE FUNCTION public.estatisticas_sistema()
RETURNS TABLE (
  total_usuarios BIGINT,
  total_planos BIGINT,
  total_tentativas BIGINT,
  taxa_sucesso_geral NUMERIC,
  planos_hoje BIGINT,
  planos_semana BIGINT,
  tempo_medio_geracao_ms INTEGER,
  tokens_totais BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.usuarios) AS total_usuarios,
    (SELECT COUNT(*) FROM public.planos_aula) AS total_planos,
    (SELECT COUNT(*) FROM public.historico_geracoes) AS total_tentativas,
    ROUND(
      100.0 * (SELECT COUNT(*) FROM public.historico_geracoes WHERE status = 'sucesso') / 
      NULLIF((SELECT COUNT(*) FROM public.historico_geracoes), 0),
      2
    ) AS taxa_sucesso_geral,
    (SELECT COUNT(*) FROM public.planos_aula WHERE created_at >= CURRENT_DATE) AS planos_hoje,
    (SELECT COUNT(*) FROM public.planos_aula WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS planos_semana,
    (SELECT AVG(tempo_geracao_ms)::INTEGER FROM public.planos_aula) AS tempo_medio_geracao_ms,
    (SELECT SUM(tokens_utilizados) FROM public.planos_aula) AS tokens_totais;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Limpar histórico antigo (manutenção)
CREATE OR REPLACE FUNCTION public.limpar_historico_antigo(dias INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  linhas_deletadas INTEGER;
BEGIN
  DELETE FROM public.historico_geracoes
  WHERE created_at < CURRENT_DATE - (dias || ' days')::INTERVAL
    AND status = 'sucesso'; -- Mantém erros para análise
  
  GET DIAGNOSTICS linhas_deletadas = ROW_COUNT;
  
  RAISE NOTICE 'Deletadas % linhas do histórico com mais de % dias', linhas_deletadas, dias;
  
  RETURN linhas_deletadas;
END;
$$ LANGUAGE plpgsql;
-- GRANTS PARA AS VIEWS E FUNÇÕES

GRANT SELECT ON public.v_estatisticas_usuario TO authenticated;
GRANT SELECT ON public.v_planos_recentes TO authenticated;
GRANT SELECT ON public.v_analise_historico TO authenticated;
GRANT SELECT ON public.v_ranking_disciplinas TO authenticated;
GRANT SELECT ON public.v_distribuicao_nivel_ensino TO authenticated;

GRANT EXECUTE ON FUNCTION public.buscar_planos(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.estatisticas_sistema() TO authenticated;
GRANT EXECUTE ON FUNCTION public.limpar_historico_antigo(INTEGER) TO authenticated;

COMMENT ON VIEW public.v_estatisticas_usuario IS 
  'Estatísticas agregadas por usuário: total de planos, disciplinas, tempo médio, etc.';

COMMENT ON VIEW public.v_planos_recentes IS 
  'Lista de planos recentes com informações do usuário e total de caracteres';

COMMENT ON VIEW public.v_analise_historico IS 
  'Análise de sucesso/erro das gerações por usuário com taxa de sucesso percentual';

COMMENT ON VIEW public.v_ranking_disciplinas IS 
  'Ranking das disciplinas mais utilizadas no sistema';

COMMENT ON VIEW public.v_distribuicao_nivel_ensino IS 
  'Distribuição de planos por nível de ensino com percentual de uso de código BNCC';

COMMENT ON FUNCTION public.buscar_planos(TEXT) IS 
  'Busca full-text em planos usando busca em português com ranking de relevância';

COMMENT ON FUNCTION public.estatisticas_sistema() IS 
  'Retorna estatísticas gerais do sistema: usuários, planos, taxa de sucesso, etc.';

COMMENT ON FUNCTION public.limpar_historico_antigo(INTEGER) IS 
  'Limpa registros de histórico bem-sucedidos mais antigos que X dias (padrão: 90)';

ANALYZE public.usuarios;
ANALYZE public.planos_aula;
ANALYZE public.historico_geracoes;
