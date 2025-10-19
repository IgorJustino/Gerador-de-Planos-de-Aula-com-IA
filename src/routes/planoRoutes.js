
const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const supabaseService = require('../services/supabaseService');
const { authenticateToken } = require('../middleware/auth');

router.post('/gerar', authenticateToken, async (req, res) => {
  const startTime = Date.now();

  console.log(`👤 Iniciando geração de plano de aula...`);
  try {
    const { tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes, disciplina } = req.body;
    
    const usuarioId = req.user.id;
    
    console.log(`👤 Gerando plano para usuário: ${req.user.email} (ID: ${usuarioId})`);

    if (!tema || !nivelEnsino || !duracaoMinutos) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Campos obrigatórios: tema, nivelEnsino, duracaoMinutos',
      });
    }

    if (codigoBNCC && !/^[A-Z]{2}\d{2}[A-Z]{2}\d{2}$/.test(codigoBNCC)) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Código BNCC inválido. Formato esperado: EF05MA01 (2 letras + 2 números + 2 letras + 2 números)',
      });
    }

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

    const resultadoGemini = await geminiService.gerarPlanoDeAula({
      tema,
      nivelEnsino,
      duracaoMinutos,
      codigoBNCC,
      observacoes,
    });

    if (!resultadoGemini.sucesso) {
      await req.supabaseAuth
        .from('historico_geracoes')
        .insert([{
          usuario_id: usuarioId,
          input_json: { tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes },
          modelo_usado: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
          status: 'erro',
          mensagem_erro: resultadoGemini.erro,
          tempo_execucao_ms: Date.now() - startTime,
        }]);

      return res.status(500).json({
        sucesso: false,
        erro: 'Erro ao gerar plano com IA: ' + resultadoGemini.erro,
      });
    }

    const { data: planoSalvo, error: erroSalvar } = await req.supabaseAuth
      .from('planos_aula')
      .insert([{
        usuario_id: usuarioId,
        tema,
        disciplina,
        nivel_ensino: nivelEnsino,
        duracao_minutos: duracaoMinutos,
        codigo_bncc: codigoBNCC,
        observacoes,
        introducao_ludica: resultadoGemini.plano.introducaoLudica,
        objetivo_aprendizagem: resultadoGemini.plano.objetivoAprendizagem,
        passo_a_passo: resultadoGemini.plano.passoAPasso,
        rubrica_avaliacao: resultadoGemini.plano.rubricaAvaliacao,
        modelo_gemini_usado: resultadoGemini.metadados.modeloUsado,
        tokens_utilizados: resultadoGemini.metadados.tokensUtilizados,
        tempo_geracao_ms: resultadoGemini.metadados.tempoGeracaoMs,
      }])
      .select()
      .single();

    if (erroSalvar) {
      console.error('❌ Erro ao salvar plano:', erroSalvar);
      
      await req.supabaseAuth
        .from('historico_geracoes')
        .insert([{
          usuario_id: usuarioId,
          input_json: { tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes },
          modelo_usado: resultadoGemini.metadados.modeloUsado,
          status: 'erro',
          mensagem_erro: `Plano gerado mas não salvo: ${erroSalvar.message}`,
          tempo_execucao_ms: Date.now() - startTime,
        }]);

      return res.status(500).json({
        sucesso: false,
        erro: 'Erro ao salvar plano no banco: ' + erroSalvar.message,
        planoGerado: resultadoGemini.plano,
      });
    }

    const resultadoSalvar = {
      sucesso: true,
      plano: planoSalvo,
    };

    if (!resultadoSalvar.sucesso) {
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

    await req.supabaseAuth
      .from('historico_geracoes')
      .insert([{
        usuario_id: usuarioId,
        plano_id: resultadoSalvar.plano.id,
        input_json: { tema, nivelEnsino, duracaoMinutos, codigoBNCC, observacoes },
        modelo_usado: resultadoGemini.metadados.modeloUsado,
        status: 'sucesso',
        tempo_execucao_ms: Date.now() - startTime,
      }]);

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

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { nivelEnsino, limite } = req.query;
    const usuarioId = req.user.id;

    let query = req.supabaseAuth
      .from('planos_aula')
      .select('*', { count: 'exact' })
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (nivelEnsino) {
      query = query.eq('nivel_ensino', nivelEnsino);
    }

    if (limite) {
      query = query.limit(parseInt(limite));
    }

    const { data: planos, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      sucesso: true,
      total: count,
      planos: planos || [],
    });
  } catch (erro) {
    console.error('❌ Erro ao listar planos:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao listar planos: ' + erro.message,
    });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: plano, error } = await req.supabaseAuth
      .from('planos_aula')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', req.user.id) // RLS garante isso, mas explicitamos
      .single();

    if (error || !plano) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Plano não encontrado',
      });
    }

    res.json({
      sucesso: true,
      plano,
    });
  } catch (erro) {
    console.error('❌ Erro ao buscar plano:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao buscar plano: ' + erro.message,
    });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await req.supabaseAuth
      .from('planos_aula')
      .delete()
      .eq('id', id)
      .eq('usuario_id', req.user.id); // RLS garante isso, mas explicitamos

    if (error) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Plano não encontrado ou você não tem permissão para deletá-lo',
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Plano deletado com sucesso',
    });
  } catch (erro) {
    console.error('❌ Erro ao deletar plano:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao deletar plano: ' + erro.message,
    });
  }
});

router.get('/historico', authenticateToken, async (req, res) => {
  try {
    const { limite } = req.query;
    const usuarioId = req.user.id;

    const { data: historico, error, count } = await req.supabaseAuth
      .from('historico_geracoes')
      .select('*', { count: 'exact' })
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(limite ? parseInt(limite) : 20);

    if (error) {
      throw error;
    }

    res.json({
      sucesso: true,
      total: count,
      historico: historico || [],
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
