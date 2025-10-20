-- ========================================
-- OTIMIZAÇÕES DE PERFORMANCE E FUNCIONALIDADES
-- Data: 18/10/2025
-- Descrição: Índices adicionais, triggers úteis, views e melhorias
-- ========================================

-- ========================================
-- 1. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ========================================

-- Índice composto para buscas por usuário + data (muito comum)
CREATE INDEX IF NOT EXISTS idx_planos_usuario_created 
  ON public.planos_aula(usuario_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_planos_disciplina 
  ON public.planos_aula(disciplina) 
  WHERE disciplina IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_planos_codigo_bncc 
  ON public.planos_aula(codigo_bncc) 
  WHERE codigo_bncc IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_planos_tema_gin 
  ON public.planos_aula USING gin(to_tsvector('portuguese', tema));

CREATE INDEX IF NOT EXISTS idx_historico_created_at 
  ON public.historico_geracoes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_historico_usuario_status 
  ON public.historico_geracoes(usuario_id, status, created_at DESC);

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
      CREATE INDEX IF NOT EXISTS idx_planos_usuario_created 
        ON public.planos_aula(usuario_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_planos_disciplina 
        ON public.planos_aula(disciplina) 
        WHERE disciplina IS NOT NULL;

      CREATE INDEX IF NOT EXISTS idx_planos_codigo_bncc 
        ON public.planos_aula(codigo_bncc) 
        WHERE codigo_bncc IS NOT NULL;

      CREATE INDEX IF NOT EXISTS idx_planos_tema_gin 
        ON public.planos_aula USING gin(to_tsvector('portuguese', tema));

      CREATE INDEX IF NOT EXISTS idx_historico_created_at 
        ON public.historico_geracoes(created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_historico_usuario_status 
        ON public.historico_geracoes(usuario_id, status, created_at DESC);

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

      CREATE OR REPLACE FUNCTION prevenir_delecao_em_massa()
      RETURNS TRIGGER AS $$
      DECLARE
        total_planos INTEGER;
      BEGIN
        SELECT COUNT(*) INTO total_planos
        FROM public.planos_aula
        WHERE usuario_id = OLD.usuario_id;
  
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

      CREATE OR REPLACE FUNCTION validar_plano_antes_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        IF LENGTH(TRIM(NEW.tema)) = 0 THEN
          RAISE EXCEPTION 'Tema não pode estar vazio';
        END IF;
  
        IF NEW.duracao_minutos < 15 OR NEW.duracao_minutos > 180 THEN
          RAISE EXCEPTION 'Duração deve estar entre 15 e 180 minutos';
        END IF;
  
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
SELECT 
