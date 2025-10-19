# 🗄️ Banco de Dados

## Estrutura

### Tabela: `usuarios`

Armazena informações dos usuários do sistema.

```sql
CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  papel text DEFAULT 'professor' CHECK (papel IN ('professor', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Índices:**
- `idx_usuarios_email` - Busca rápida por email

---

### Tabela: `planos_aula`

Armazena os planos de aula gerados pela IA.

```sql
CREATE TABLE public.planos_aula (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  usuario_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Inputs do usuário
  tema text NOT NULL,
  disciplina text,
  nivel_ensino text NOT NULL,
  duracao_minutos integer NOT NULL DEFAULT 50,
  codigo_bncc text,
  observacoes text,
  
  -- Conteúdo gerado pela IA
  introducao_ludica text NOT NULL,
  objetivo_aprendizagem text NOT NULL,
  passo_a_passo text NOT NULL,
  rubrica_avaliacao text NOT NULL,
  
  -- Metadados
  modelo_gemini_usado text DEFAULT 'gemini-2.5-flash',
  tokens_utilizados integer,
  tempo_geracao_ms integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Índices:**
- `idx_planos_usuario_id` - Consultas por usuário
- `idx_planos_created_at` - Ordenação por data
- `idx_planos_nivel_ensino` - Filtro por nível

---

### Tabela: `historico_geracoes`

Log de todas as tentativas de geração.

```sql
CREATE TABLE public.historico_geracoes (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  usuario_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE,
  plano_id bigint REFERENCES public.planos_aula(id) ON DELETE SET NULL,
  
  input_json jsonb NOT NULL,
  modelo_usado text NOT NULL,
  status text NOT NULL CHECK (status IN ('sucesso', 'erro')),
  mensagem_erro text,
  tempo_execucao_ms integer,
  
  created_at timestamptz DEFAULT now()
);
```

**Índices:**
- `idx_historico_usuario_id` - Análise por usuário
- `idx_historico_status` - Análise de erros/sucessos

---

## Relacionamentos

```
usuarios (1) ──── (N) planos_aula
    │
    └──── (N) historico_geracoes

planos_aula (1) ──── (N) historico_geracoes
```

---

## Row Level Security (RLS)

### Políticas Ativas

**usuarios:**
- Usuários podem ver apenas seus próprios dados
- Usuários podem atualizar seus próprios dados

**planos_aula:**
- Usuários veem apenas seus planos
- Usuários podem criar planos
- Usuários podem deletar seus planos

**historico_geracoes:**
- Usuários veem apenas seu histórico

---

## Triggers

### `update_updated_at_column`

Atualiza automaticamente o campo `updated_at` nas tabelas `usuarios` e `planos_aula`.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Migrações

Localização: `/supabase/migrations/`

**Ordem de aplicação:**
1. `20251017205334_criar_tabelas_sistema.sql` - Estrutura inicial
2. `20251018010000_simplificar_rls.sql` - Políticas RLS
3. `20251018020000_otimizacoes_performance.sql` - Índices e views
4. `20251018030000_corrigir_duplicacao.sql` - Correções

**Aplicar migrações:**
```bash
npx supabase db reset
```

---

## Queries Úteis

### Estatísticas de uso
```sql
SELECT 
  COUNT(DISTINCT usuario_id) as total_usuarios,
  COUNT(*) as total_planos,
  AVG(tempo_geracao_ms) as tempo_medio_ms
FROM planos_aula;
```

### Planos mais recentes
```sql
SELECT tema, nivel_ensino, created_at
FROM planos_aula
ORDER BY created_at DESC
LIMIT 10;
```

### Taxa de sucesso
```sql
SELECT 
  status,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual
FROM historico_geracoes
GROUP BY status;
```
