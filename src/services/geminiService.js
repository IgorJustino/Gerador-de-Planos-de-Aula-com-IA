// ========================================
// SERVIÇO: Integração com Google Gemini AI
// ========================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Inicializar cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gera um plano de aula completo usando Google Gemini
 * @param {Object} dados - Dados para geração do plano
 * @param {string} dados.tema - Tema da aula
 * @param {string} dados.nivelEnsino - Nível de ensino (Ex: "Ensino Fundamental I")
 * @param {number} dados.duracaoMinutos - Duração em minutos
 * @param {string} dados.codigoBNCC - Código da habilidade BNCC (opcional)
 * @param {string} dados.observacoes - Observações adicionais (opcional)
 * @returns {Promise<Object>} Plano de aula gerado
 */
async function gerarPlanoDeAula(dados) {
  const startTime = Date.now();

  try {
    // Escolher o modelo (pode ser configurado no .env)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
    const model = genAI.getGenerativeModel({ model: modelName });

    // Construir o prompt estruturado
    const prompt = construirPrompt(dados);

    // Configurar parâmetros de geração
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    };

    // Gerar conteúdo
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const texto = response.text();

    // Processar resposta e extrair as 4 partes
    const planoGerado = processarRespostaGemini(texto);

    // Calcular métricas
    const tempoExecucao = Date.now() - startTime;
    const tokensUsados = response.usageMetadata?.totalTokenCount || 0;

    return {
      sucesso: true,
      plano: planoGerado,
      metadados: {
        modeloUsado: modelName,
        tokensUtilizados: tokensUsados,
        tempoGeracaoMs: tempoExecucao,
      },
    };
  } catch (erro) {
    const tempoExecucao = Date.now() - startTime;

    console.error('❌ Erro ao gerar plano com Gemini:', erro.message);

    return {
      sucesso: false,
      erro: erro.message,
      metadados: {
        tempoGeracaoMs: tempoExecucao,
      },
    };
  }
}

/**
 * Constrói o prompt otimizado para o Gemini
 */
function construirPrompt(dados) {
  const { tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes } = dados;

  return `
Você é um especialista em pedagogia e criação de planos de aula inovadores e alinhados à BNCC (Base Nacional Comum Curricular).

**TAREFA:**
Crie um plano de aula completo e criativo sobre o tema "${tema}" para ${nivelEnsino}, com duração de ${duracaoMinutos} minutos.
${codigoBNCC ? `\nHabilidade BNCC: ${codigoBNCC}` : ''}
${observacoes ? `\nObservações do professor: ${observacoes}` : ''}

**ESTRUTURA OBRIGATÓRIA (4 PARTES):**

---

## 1. INTRODUÇÃO LÚDICA
Crie uma introdução criativa, motivadora e engajante que capture a atenção dos alunos. Use linguagem acessível, perguntas instigantes, exemplos do cotidiano ou situações-problema interessantes. Inclua emojis para tornar o texto mais visual.

---

## 2. OBJETIVO DE APRENDIZAGEM
Defina 1 objetivo claro e mensurável, alinhado à BNCC. Use verbos da Taxonomia de Bloom (compreender, identificar, analisar, criar, etc.). Seja específico sobre o que o aluno será capaz de fazer ao final da aula.

---

## 3. PASSO A PASSO DA ATIVIDADE
Divida a aula em etapas numeradas e detalhadas:
- Etapa 1: Introdução/Contextualização (tempo estimado)
- Etapa 2: Exploração/Desenvolvimento (tempo estimado)
- Etapa 3: Atividade Prática/Aplicação (tempo estimado)
- Etapa 4: Fechamento/Avaliação (tempo estimado)

Seja específico: quais materiais usar, como organizar a turma, perguntas para fazer, exemplos concretos.

---

## 4. RUBRICA DE AVALIAÇÃO
Crie critérios claros de avaliação com 4 níveis:
- ✅ Excelente (9-10 pontos)
- ✅ Bom (7-8 pontos)
- ✅ Satisfatório (5-6 pontos)
- ⚠️ Precisa Melhorar (abaixo de 5 pontos) + sugestão de ação pedagógica

Para cada nível, descreva comportamentos observáveis e habilidades demonstradas.

---

**DIRETRIZES:**
- Seja criativo e original
- Use linguagem clara e objetiva
- Adapte a complexidade ao nível de ensino
- Sugira atividades práticas e interativas
- Inclua possibilidades de diferenciação pedagógica
- Garanta que as 4 partes sejam claramente separadas com títulos em maiúsculas

**FORMATO DE RESPOSTA:**
Responda EXATAMENTE neste formato, usando os títulos em maiúsculas:

INTRODUÇÃO LÚDICA
[seu texto aqui]

OBJETIVO DE APRENDIZAGEM
[seu texto aqui]

PASSO A PASSO DA ATIVIDADE
[seu texto aqui]

RUBRICA DE AVALIAÇÃO
[seu texto aqui]
`.trim();
}

/**
 * Processa a resposta do Gemini e extrai as 4 partes do plano
 */
function processarRespostaGemini(texto) {
  // Padrões para identificar cada seção
  const secoes = {
    introducaoLudica: extrairSecao(texto, 'INTRODUÇÃO LÚDICA', 'OBJETIVO DE APRENDIZAGEM'),
    objetivoAprendizagem: extrairSecao(texto, 'OBJETIVO DE APRENDIZAGEM', 'PASSO A PASSO'),
    passoAPasso: extrairSecao(texto, 'PASSO A PASSO', 'RUBRICA DE AVALIAÇÃO'),
    rubricaAvaliacao: extrairSecao(texto, 'RUBRICA DE AVALIAÇÃO', null),
  };

  // Validar se todas as partes foram encontradas
  const partesVazias = Object.entries(secoes).filter(([_, valor]) => !valor.trim());

  if (partesVazias.length > 0) {
    console.warn('⚠️ Algumas seções não foram encontradas:', partesVazias.map(([k]) => k));
  }

  return {
    introducaoLudica: secoes.introducaoLudica.trim() || 'Não foi possível gerar esta seção.',
    objetivoAprendizagem: secoes.objetivoAprendizagem.trim() || 'Não foi possível gerar esta seção.',
    passoAPasso: secoes.passoAPasso.trim() || 'Não foi possível gerar esta seção.',
    rubricaAvaliacao: secoes.rubricaAvaliacao.trim() || 'Não foi possível gerar esta seção.',
  };
}

/**
 * Extrai uma seção específica do texto
 */
function extrairSecao(texto, inicioMarcador, fimMarcador) {
  const regexInicio = new RegExp(`${inicioMarcador}[:\\s]*`, 'i');
  const matchInicio = texto.match(regexInicio);

  if (!matchInicio) {
    return '';
  }

  const posicaoInicio = matchInicio.index + matchInicio[0].length;

  let posicaoFim;
  if (fimMarcador) {
    const regexFim = new RegExp(`${fimMarcador}[:\\s]*`, 'i');
    const matchFim = texto.slice(posicaoInicio).match(regexFim);
    posicaoFim = matchFim ? posicaoInicio + matchFim.index : texto.length;
  } else {
    posicaoFim = texto.length;
  }

  return texto.slice(posicaoInicio, posicaoFim).trim();
}

/**
 * Testa a conexão com a API Gemini
 */
async function testarConexao() {
  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Responda apenas: OK');
    const texto = result.response.text();

    return {
      sucesso: true,
      mensagem: 'Conexão com Gemini estabelecida ✅',
      resposta: texto,
    };
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: 'Erro ao conectar com Gemini ❌',
      erro: erro.message,
    };
  }
}

module.exports = {
  gerarPlanoDeAula,
  testarConexao,
};
