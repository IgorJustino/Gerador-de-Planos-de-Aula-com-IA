-- ========================================
-- SEED.SQL - Dados Iniciais para Teste
-- ========================================
-- Este arquivo é executado automaticamente quando você roda:
-- supabase db reset

-- ========================================
-- 1. INSERIR USUÁRIOS DE TESTE
-- ========================================

-- Senha para todos: "senha123" (hash bcrypt)
-- IMPORTANTE: Em produção, use bcrypt real! Este é apenas um exemplo
insert into public.usuarios (id, nome, email, senha_hash, tipo_usuario) values
  (gen_random_uuid(), 'Prof. João Silva', 'joao@escola.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'professor'),
  (gen_random_uuid(), 'Profa. Maria Santos', 'maria@escola.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'professor'),
  (gen_random_uuid(), 'Admin Sistema', 'admin@escola.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'admin');

-- ========================================
-- 2. INSERIR PLANOS DE AULA DE EXEMPLO
-- ========================================

insert into public.planos_aula 
  (usuario_id, tema, nivel_ensino, duracao_minutos, codigo_bncc, 
   introducao_ludica, objetivo_aprendizagem, passo_a_passo, rubrica_avaliacao,
   modelo_gemini_usado, tokens_utilizados, tempo_geracao_ms)
values
  (
    (select id from public.usuarios where email = 'joao@escola.com' limit 1),
    'Sistema Solar e Planetas',
    'Ensino Fundamental I',
    50,
    'EF05CI11',
    '🌟 Bem-vindos, jovens astronautas! Hoje vamos embarcar em uma incrível viagem espacial sem sair da sala de aula! Vocês sabiam que existem planetas gigantes feitos de gás e outros tão pequenos que caberiam dentro da Terra? Preparem seus capacetes imaginários, porque hoje vamos descobrir os segredos do nosso Sistema Solar!',
    'Compreender a organização do Sistema Solar, identificando os planetas e suas principais características, desenvolvendo habilidades de observação, comparação e representação espacial, conforme a BNCC (EF05CI11).',
    '**Etapa 1 - Introdução Motivadora (10 min)**
- Exibir vídeo curto sobre o Sistema Solar
- Questionar: "Qual planeta vocês gostariam de visitar?"
- Anotar respostas na lousa

**Etapa 2 - Exploração Guiada (15 min)**
- Apresentar maquete do Sistema Solar
- Explicar posição e características de cada planeta
- Demonstrar órbitas usando movimento circular

**Etapa 3 - Atividade Prática (20 min)**
- Dividir turma em 8 grupos (1 por planeta)
- Cada grupo cria cartaz com: nome, tamanho, cor, curiosidade
- Usar materiais: papel, canetinhas, cola, imagens impressas

**Etapa 4 - Apresentação e Socialização (15 min)**
- Cada grupo apresenta seu planeta (2 min cada)
- Montar mural coletivo do Sistema Solar na parede
- Reflexão final: "O que mais surpreendeu vocês?"',
    '**Critérios de Avaliação:**

✅ **Excelente (9-10)**
- Identifica todos os 8 planetas corretamente
- Descreve pelo menos 3 características de cada
- Participa ativamente da atividade em grupo
- Apresentação clara e criativa

✅ **Bom (7-8)**
- Identifica 6-7 planetas
- Descreve 2 características de cada
- Participa da atividade com alguma orientação
- Apresentação compreensível

✅ **Satisfatório (5-6)**
- Identifica 4-5 planetas
- Descreve 1 característica
- Participa parcialmente
- Apresentação com ajuda do professor

⚠️ **Precisa Melhorar (abaixo de 5)**
- Dificuldade em identificar planetas
- Não descreve características
- Participação mínima
- **Ação:** Atendimento individualizado e atividade complementar',
    'gemini-1.5-pro',
    2458,
    3200
  ),
  (
    (select id from public.usuarios where email = 'maria@escola.com' limit 1),
    'Frações no Dia a Dia',
    'Ensino Fundamental I',
    45,
    'EF04MA09',
    '🍕 Quem aqui gosta de pizza? Imaginem que chegou uma pizza quentinha e precisamos dividir entre 4 amigos. Como fazemos? E se sobrarem 2 pedaços, quanto isso representa da pizza inteira? Hoje vamos descobrir que a matemática está escondida na hora do lanche!',
    'Reconhecer e representar frações como parte de um todo, utilizando situações do cotidiano para desenvolver o raciocínio matemático e a resolução de problemas, conforme BNCC (EF04MA09).',
    '**Etapa 1 - Contexto Real (10 min)**
- Trazer objetos divisíveis: laranja, chocolate, papel
- Dividir fisicamente e questionar "que parte é essa?"
- Introduzir termos: metade, terço, quarto

**Etapa 2 - Representação Visual (15 min)**
- Desenhar círculos na lousa
- Dividir em 2, 3, 4, 8 partes
- Pintar frações: 1/2, 2/4, 3/8
- Alunos reproduzem no caderno

**Etapa 3 - Jogo das Frações (15 min)**
- Distribuir folhas com figuras divididas
- Desafio: pintar a fração indicada
- Exemplos: "Pinte 3/4 do quadrado"
- Trabalho em duplas

**Etapa 4 - Fechamento (5 min)**
- Cada dupla mostra 1 resposta
- Validação coletiva
- Lição de casa: encontrar frações em casa (receitas, embalagens)',
    '**Critérios de Avaliação:**

✅ **Excelente (9-10)**
- Representa corretamente todas as frações
- Identifica numerador e denominador
- Resolve problemas contextualizados
- Explica o raciocínio usado

✅ **Bom (7-8)**
- Representa a maioria das frações
- Identifica partes da fração com pequenos erros
- Resolve problemas com orientação
- Explica parcialmente

✅ **Satisfatório (5-6)**
- Representa frações simples (1/2, 1/4)
- Confunde numerador/denominador ocasionalmente
- Resolve com apoio visual
- Dificuldade em verbalizar

⚠️ **Precisa Melhorar (abaixo de 5)**
- Não representa frações corretamente
- Não diferencia partes da fração
- Não resolve problemas
- **Ação:** Recuperação paralela com material concreto',
    'gemini-1.5-flash',
    1820,
    1500
  );

-- ========================================
-- 3. INSERIR HISTÓRICO DE GERAÇÕES
-- ========================================

insert into public.historico_geracoes 
  (usuario_id, plano_id, input_json, modelo_usado, status, tempo_execucao_ms)
values
  (
    (select id from public.usuarios where email = 'joao@escola.com' limit 1),
    (select id from public.planos_aula where tema = 'Sistema Solar e Planetas' limit 1),
    '{"tema": "Sistema Solar e Planetas", "nivel": "Ensino Fundamental I", "duracao": 50, "codigo_bncc": "EF05CI11"}'::jsonb,
    'gemini-1.5-pro',
    'sucesso',
    3200
  ),
  (
    (select id from public.usuarios where email = 'maria@escola.com' limit 1),
    (select id from public.planos_aula where tema = 'Frações no Dia a Dia' limit 1),
    '{"tema": "Frações no Dia a Dia", "nivel": "Ensino Fundamental I", "duracao": 45, "codigo_bncc": "EF04MA09"}'::jsonb,
    'gemini-1.5-flash',
    'sucesso',
    1500
  ),
  (
    (select id from public.usuarios where email = 'joao@escola.com' limit 1),
    null,
    '{"tema": "Teste Inválido", "nivel": "Ensino Médio", "duracao": 60}'::jsonb,
    'gemini-1.5-pro',
    'erro',
    500
  );

-- ========================================
-- 4. MENSAGEM DE CONFIRMAÇÃO
-- ========================================
-- Para ver o resultado, após rodar o seed, execute:
-- SELECT * FROM usuarios;
-- SELECT * FROM planos_aula;
-- SELECT * FROM historico_geracoes;
