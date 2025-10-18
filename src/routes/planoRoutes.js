// ========================================
// ROTAS: Planos de Aula
// ========================================

const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const supabaseService = require('../services/supabaseService');

// ========================================
// POST /api/planos/gerar
// Gera um novo plano de aula com IA
// ========================================
router.post('/gerar', async (req, res) => {
  const startTime = Date.now();

  try {
    let { usuarioId, tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes } = req.body;

    // Se não houver usuarioId, usar um ID padrão (para demo sem autenticação)
    if (!usuarioId) {
      // Buscar o primeiro usuário disponível no banco
      const { data: usuarios } = await require('../services/supabaseService').supabase
        .from('usuarios')
        .select('id')
        .limit(1);
      
      if (usuarios && usuarios.length > 0) {
        usuarioId = usuarios[0].id;
        console.log(`ℹ️ Usando usuário padrão: ${usuarioId}`);
      }
    }

    // Validação de campos obrigatórios
    if (!tema || !nivelEnsino || !duracaoMinutos) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Campos obrigatórios: tema, nivelEnsino, duracaoMinutos',
      });
    }

    // Validação de nível de ensino
    const niveisValidos = [
      'Educação Infantil',
      'Ensino Fundamental I',
      'Ensino Fundamental II',
      'Ensino Médio',
    ];

    if (!niveisValidos.includes(nivelEnsino)) {
      return res.status(400).json({
        sucesso: false,
        erro: `Nível de ensino inválido. Opções: ${niveisValidos.join(', ')}`,
      });
    }

    console.log(`📚 Gerando plano de aula sobre "${tema}" para ${nivelEnsino}...`);

    // 1️⃣ Gerar plano com Gemini AI
    const resultadoGemini = await geminiService.gerarPlanoDeAula({
      tema,
      nivelEnsino,
      duracaoMinutos,
      codigoBNCC,
      observacoes,
    });

    if (!resultadoGemini.sucesso) {
      // Registrar falha no histórico
      await supabaseService.registrarHistorico({
        usuarioId,
        inputJson: { tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes },
        modeloUsado: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
        status: 'erro',
        mensagemErro: resultadoGemini.erro,
        tempoExecucaoMs: Date.now() - startTime,
      });

      return res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar plano com IA: ' + resultadoGemini.erro,
      });
    }

    // 2️⃣ Salvar plano no Supabase
    const resultadoSalvar = await supabaseService.salvarPlanoDeAula({
      usuarioId,
      tema,
      nivelEnsino,
      duracaoMinutos,
      codigoBNCC,
      observacoes,
      ...resultadoGemini.plano,
      modeloGeminiUsado: resultadoGemini.metadados.modeloUsado,
      tokensUtilizados: resultadoGemini.metadados.tokensUtilizados,
      tempoGeracaoMs: resultadoGemini.metadados.tempoGeracaoMs,
    });

    if (!resultadoSalvar.sucesso) {
      // Plano gerado mas não salvo (registrar no histórico mesmo assim)
      await supabaseService.registrarHistorico({
        usuarioId,
        inputJson: { tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes },
        modeloUsado: resultadoGemini.metadados.modeloUsado,
        status: 'erro',
        mensagemErro: `Plano gerado mas não salvo: ${resultadoSalvar.erro}`,
        tempoExecucaoMs: Date.now() - startTime,
      });

      return res.status(500).json({
        sucesso: false,
        erro: 'Erro ao salvar plano no banco: ' + resultadoSalvar.erro,
        planoGerado: resultadoGemini.plano, // Retorna o plano mesmo sem salvar
      });
    }

    // 3️⃣ Registrar sucesso no histórico
    await supabaseService.registrarHistorico({
      usuarioId,
      planoId: resultadoSalvar.plano.id,
      inputJson: { tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes },
      modeloUsado: resultadoGemini.metadados.modeloUsado,
      status: 'sucesso',
      tempoExecucaoMs: Date.now() - startTime,
    });

    // ✅ Sucesso total!
    console.log(`✅ Plano gerado e salvo com sucesso! (ID: ${resultadoSalvar.plano.id})`);

    res.status(201).json({
      sucesso: true,
      mensagem: 'Plano de aula gerado com sucesso! 🎉',
      planoId: resultadoSalvar.plano.id,
      introducaoLudica: resultadoGemini.plano.introducaoLudica,
      objetivoAprendizagem: resultadoGemini.plano.objetivoAprendizagem,
      passoAPasso: resultadoGemini.plano.passoAPasso,
      rubricaAvaliacao: resultadoGemini.plano.rubricaAvaliacao,
      metadados: {
        tempoTotalMs: Date.now() - startTime,
        ...resultadoGemini.metadados,
      },
    });
  } catch (erro) {
    console.error('❌ Erro inesperado ao gerar plano:', erro);

    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor: ' + erro.message,
    });
  }
});

// ========================================
// GET /api/planos
// Lista planos de aula de um usuário
// ========================================
router.get('/', async (req, res) => {
  try {
    const { usuarioId, nivelEnsino, limite } = req.query;

    if (!usuarioId) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Parâmetro obrigatório: usuarioId',
      });
    }

    const filtros = {
      nivelEnsino,
      limite: limite ? parseInt(limite) : undefined,
    };

    const resultado = await supabaseService.buscarPlanosDeAula(usuarioId, filtros);

    if (!resultado.sucesso) {
      return res.status(500).json(resultado);
    }

    res.json({
      sucesso: true,
      total: resultado.total,
      planos: resultado.planos,
    });
  } catch (erro) {
    console.error('❌ Erro ao listar planos:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao listar planos: ' + erro.message,
    });
  }
});

// ========================================
// GET /api/planos/:id
// Busca um plano específico por ID
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await supabaseService.buscarPlanoPorId(id);

    if (!resultado.sucesso) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Plano não encontrado',
      });
    }

    res.json({
      sucesso: true,
      plano: resultado.plano,
    });
  } catch (erro) {
    console.error('❌ Erro ao buscar plano:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao buscar plano: ' + erro.message,
    });
  }
});

// ========================================
// DELETE /api/planos/:id
// Deleta um plano de aula
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Campo obrigatório: usuarioId',
      });
    }

    const resultado = await supabaseService.deletarPlano(id, usuarioId);

    if (!resultado.sucesso) {
      return res.status(404).json(resultado);
    }

    res.json(resultado);
  } catch (erro) {
    console.error('❌ Erro ao deletar plano:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao deletar plano: ' + erro.message,
    });
  }
});

// ========================================
// GET /api/planos/historico/:usuarioId
// Busca histórico de gerações de um usuário
// ========================================
router.get('/historico/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { limite } = req.query;

    const resultado = await supabaseService.buscarHistorico(
      usuarioId,
      limite ? parseInt(limite) : 20
    );

    if (!resultado.sucesso) {
      return res.status(500).json(resultado);
    }

    res.json({
      sucesso: true,
      total: resultado.total,
      historico: resultado.historico,
    });
  } catch (erro) {
    console.error('❌ Erro ao buscar histórico:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao buscar histórico: ' + erro.message,
    });
  }
});

module.exports = router;
