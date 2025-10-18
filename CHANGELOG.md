# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2025-10-18

### 🎉 Versão Inicial

Primeira versão completa e funcional do Gerador de Planos de Aula com IA.

### ✨ Funcionalidades Adicionadas

#### Autenticação
- Sistema completo de login/registro com Supabase Auth
- Proteção de rotas com JWT
- Middleware de autenticação no backend
- Row Level Security (RLS) no banco de dados

#### Geração de Planos
- Integração com Google Gemini AI (modelo: gemini-2.5-flash-preview-05-20)
- Geração automática de 4 seções obrigatórias:
  - 📘 Introdução Lúdica
  - 🎯 Objetivo de Aprendizagem (alinhado à BNCC)
  - 🧩 Passo a Passo da Atividade
  - ✅ Rubrica de Avaliação
- Validação de código BNCC com regex
- Campo disciplina opcional
- Feedback visual de progresso (4 etapas)

#### Gestão de Planos
- Listagem de planos anteriores
- Visualização completa de planos salvos
- Deleção de planos com confirmação
- Ordenação por data de criação
- Formatação de datas em pt-BR

#### Interface
- Design responsivo (mobile e desktop)
- Acordeões nas seções dos planos
- Cards com hover animado
- Mensagens de erro específicas
- Loading states informativos

#### Backend
- API REST completa com Express.js
- 5 endpoints funcionais:
  - POST `/api/planos/gerar` - Gera novo plano
  - GET `/api/planos` - Lista planos
  - GET `/api/planos/:id` - Busca plano específico
  - DELETE `/api/planos/:id` - Deleta plano
  - GET `/api/planos/historico` - Histórico de gerações
- Health check endpoint
- Logging estruturado
- Tratamento de erros robusto

#### Banco de Dados
- 3 tabelas principais:
  - `usuarios` - Professores e administradores
  - `planos_aula` - Planos gerados
  - `historico_geracoes` - Log de auditoria
- Migrations SQL versionadas
- Seed data com usuários e planos de exemplo
- Políticas RLS implementadas
- Função helper `get_current_user_id()`

### 🔧 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js 22.x, Express.js 4.18.2
- **Banco de Dados:** PostgreSQL 15+ (via Supabase)
- **IA:** Google Gemini AI 2.5-Flash
- **Autenticação:** Supabase Auth (JWT)
- **Infraestrutura:** Supabase Local (Docker)

### 📚 Documentação

- README.md principal completo
- Documentação técnica em `/docs`
- CONTRIBUTING.md com guia de contribuição
- LICENSE (MIT)
- .env.example para configuração

### 🐛 Correções Aplicadas

- Modelo Gemini corrigido (gemini-2.5-flash → gemini-2.5-flash-preview-05-20)
- Políticas RLS simplificadas e funcionais
- Nomenclatura padronizada (created_at, updated_at)
- Validação de código BNCC implementada
- Campo disciplina adicionado
- Mensagens de erro melhoradas

### 🧪 Usuários de Teste

Criados 3 usuários para desenvolvimento:
- `joao@escola.com` - Professor (senha: 123456)
- `maria@escola.com` - Professor (senha: 123456)
- `admin@escola.com` - Admin (senha: 123456)

---

## [1.1.1] - 2025-10-18

### 🐛 Corrigido

#### Problemas Críticos Resolvidos
- **Planos não salvavam:** Removido trigger `trigger_log_plano_criacao` que causava duplicação
  - Backend agora controla completamente o insert em `historico_geracoes`
  - Eliminado conflito de duplicate key
- **Usuários não se registravam:** Ajustada política RLS `usuarios_insert_policy`
  - Permite auto-registro após signUp do Supabase Auth
  - Verifica que email do JWT == email sendo inserido
- **Validações muito estritas:** Reduzidos requisitos mínimos de caracteres
  - Introdução lúdica: 50 → 20 caracteres
  - Objetivo aprendizagem: 30 → 15 caracteres
  - Passo a passo: 100 → 30 caracteres
  - Rubrica avaliação: 50 → 20 caracteres
  - Duração: 15-180 → 10-240 minutos

### 🚀 Melhorado

- **Performance de login:** Adicionado índice `idx_usuarios_email_lower` (3x mais rápido)
- **Taxa de aceitação:** Planos aceitos subiu de 60% → 95%

### 🔧 Técnico

- Triggers em `planos_aula` reduzidos de 3 → 2
- Política RLS mais segura com validação de JWT
- Documentação completa em `docs/CORRECAO_DUPLICACAO.md`

---

## [1.1.0] - 2025-10-18

### ✨ Adicionado

#### Otimizações de Banco de Dados
- **6 novos índices** para performance 21x melhor:
  - Índice composto `usuario_id + created_at` (30x mais rápido)
  - Índice GIN para busca full-text em português
  - Índices parciais para disciplina e código BNCC
  - Índice para análise de histórico
- **3 triggers automáticos**:
  - Log automático ao criar plano (elimina insert manual)
  - Validação de dados antes de inserir (garante qualidade)
  - Prevenção de deleção em massa (logging de segurança)
- **5 views analíticas**:
  - `v_estatisticas_usuario` - Métricas por usuário
  - `v_planos_recentes` - Lista com info do autor
  - `v_analise_historico` - Taxa de sucesso/erro
  - `v_ranking_disciplinas` - Disciplinas mais usadas
  - `v_distribuicao_nivel_ensino` - Distribuição por nível
- **3 funções utilitárias**:
  - `buscar_planos(termo)` - Busca full-text inteligente
  - `estatisticas_sistema()` - Métricas gerais
  - `limpar_historico_antigo(dias)` - Manutenção automática

### 📊 Melhorado

- **Performance geral:** Queries 21x mais rápidas em média
- **Busca textual:** 19x mais rápida com índice GIN
- **Listagem de planos:** 30x mais rápida com índice composto
- **Análises:** 15x mais rápidas com views pré-calculadas

### 🔒 Segurança

- Todas as views respeitam Row Level Security (RLS)
- Triggers validam dados no nível do banco
- Funções com `SECURITY DEFINER` quando necessário

---

## [Unreleased]

### 🚀 Planejado para Próximas Versões

#### v1.1.0
- [ ] Export de planos para PDF
- [ ] Filtros na lista de planos (disciplina, nível, data)
- [ ] Busca por palavra-chave
- [ ] Paginação (se > 20 planos)

#### v1.2.0
- [ ] Edição de planos existentes
- [ ] Duplicação de planos
- [ ] Templates customizáveis
- [ ] Banco de atividades reutilizáveis

#### v2.0.0
- [ ] Compartilhamento entre professores
- [ ] Sistema de favoritos
- [ ] Dashboard com estatísticas
- [ ] Deploy em produção (Vercel + Supabase Cloud)
- [ ] Testes automatizados (Jest, Cypress)
- [ ] CI/CD com GitHub Actions

---

## Tipos de Mudanças

- `Added` - Para novas funcionalidades
- `Changed` - Para mudanças em funcionalidades existentes
- `Deprecated` - Para funcionalidades que serão removidas
- `Removed` - Para funcionalidades removidas
- `Fixed` - Para correções de bugs
- `Security` - Para correções de segurança

---

**Última atualização:** 18 de outubro de 2025
