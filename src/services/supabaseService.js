const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis SUPABASE_URL e SUPABASE_ANON_KEY não configuradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Salva um novo plano de aula no banco de dados
 * @param {Object} dadosPlano - Dados completos do plano
 * @returns {Promise<Object>} Resultado da inserção
 */
async function salvarPlanoDeAula(dadosPlano) {
  try {
    const { data, error } = await supabase
      .from('planos_aula')
      .insert([
        {
          usuario_id: dadosPlano.usuarioId,
          tema: dadosPlano.tema,
          nivel_ensino: dadosPlano.nivelEnsino,
          duracao_minutos: dadosPlano.duracaoMinutos,
          codigo_bncc: dadosPlano.codigoBNCC,
          observacoes: dadosPlano.observacoes,
          introducao_ludica: dadosPlano.introducaoLudica,
          objetivo_aprendizagem: dadosPlano.objetivoAprendizagem,
          passo_a_passo: dadosPlano.passoAPasso,
          rubrica_avaliacao: dadosPlano.rubricaAvaliacao,
          modelo_gemini_usado: dadosPlano.modeloGeminiUsado,
          tokens_utilizados: dadosPlano.tokensUtilizados,
          tempo_geracao_ms: dadosPlano.tempoGeracaoMs,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Erro ao salvar plano: ${error.message}`);
    }

    return {
      sucesso: true,
      plano: data[0],
      mensagem: 'Plano de aula salvo com sucesso! ✅',
    };
  } catch (erro) {
    console.error('❌ Erro ao salvar plano no Supabase:', erro.message);
    return {
      sucesso: false,
      erro: erro.message,
    };
  }
}

/**
 * Busca planos de aula de um usuário específico
 * @param {string} usuarioId - UUID do usuário
 * @param {Object} filtros - Filtros opcionais (nivelEnsino, limite, etc.)
 * @returns {Promise<Object>} Lista de planos
 */
async function buscarPlanosDeAula(usuarioId, filtros = {}) {
  try {
    let query = supabase
      .from('planos_aula')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    // Aplicar filtros opcionais
    if (filtros.nivelEnsino) {
      query = query.eq('nivel_ensino', filtros.nivelEnsino);
    }

    if (filtros.limite) {
      query = query.limit(filtros.limite);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar planos: ${error.message}`);
    }

    return {
      sucesso: true,
      planos: data,
      total: data.length,
    };
  } catch (erro) {
    console.error('❌ Erro ao buscar planos:', erro.message);
    return {
      sucesso: false,
      erro: erro.message,
    };
  }
}

/**
 * Busca um plano de aula específico por ID
 * @param {number} planoId - ID do plano
 * @returns {Promise<Object>} Plano encontrado
 */
async function buscarPlanoPorId(planoId) {
  try {
    const { data, error } = await supabase
      .from('planos_aula')
      .select('*')
      .eq('id', planoId)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar plano: ${error.message}`);
    }

    return {
      sucesso: true,
      plano: data,
    };
  } catch (erro) {
    console.error('❌ Erro ao buscar plano por ID:', erro.message);
    return {
      sucesso: false,
      erro: erro.message,
    };
  }
}

/**
 * Deleta um plano de aula
 * @param {number} planoId - ID do plano a deletar
 * @param {string} usuarioId - UUID do usuário (validação de posse)
 * @returns {Promise<Object>} Resultado da deleção
 */
async function deletarPlano(planoId, usuarioId) {
  try {
    const { data, error } = await supabase
      .from('planos_aula')
      .delete()
      .eq('id', planoId)
      .eq('usuario_id', usuarioId)
      .select();

    if (error) {
      throw new Error(`Erro ao deletar plano: ${error.message}`);
    }

    if (data.length === 0) {
      throw new Error('Plano não encontrado ou você não tem permissão para deletá-lo');
    }

    return {
      sucesso: true,
      mensagem: 'Plano deletado com sucesso! 🗑️',
    };
  } catch (erro) {
    console.error('❌ Erro ao deletar plano:', erro.message);
    return {
      sucesso: false,
      erro: erro.message,
    };
  }
}

/**
 * Registra uma tentativa de geração no histórico
 * @param {Object} dados - Dados da geração
 * @returns {Promise<Object>} Resultado do registro
 */
async function registrarHistorico(dados) {
  try {
    const { data, error } = await supabase
      .from('historico_geracoes')
      .insert([
        {
          usuario_id: dados.usuarioId,
          plano_id: dados.planoId || null,
          input_json: dados.inputJson,
          modelo_usado: dados.modeloUsado,
          status: dados.status, // 'sucesso' ou 'erro'
          mensagem_erro: dados.mensagemErro || null,
          tempo_execucao_ms: dados.tempoExecucaoMs,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Erro ao registrar histórico: ${error.message}`);
    }

    return {
      sucesso: true,
      historico: data[0],
    };
  } catch (erro) {
    console.error('❌ Erro ao registrar histórico:', erro.message);
    return {
      sucesso: false,
      erro: erro.message,
    };
  }
}

/**
 * Busca histórico de gerações de um usuário
 * @param {string} usuarioId - UUID do usuário
 * @param {number} limite - Número máximo de registros
 * @returns {Promise<Object>} Histórico de gerações
 */
async function buscarHistorico(usuarioId, limite = 20) {
  try {
    const { data, error } = await supabase
      .from('historico_geracoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(limite);

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return {
      sucesso: true,
      historico: data,
      total: data.length,
    };
  } catch (erro) {
    console.error('❌ Erro ao buscar histórico:', erro.message);
    return {
      sucesso: false,
      erro: erro.message,
    };
  }
}

// ========================================
// OPERAÇÕES: USUÁRIOS
// ========================================

/**
 * Busca informações de um usuário por ID
 * @param {string} usuarioId - UUID do usuário
 * @returns {Promise<Object>} Dados do usuário
 */
async function buscarUsuarioPorId(usuarioId) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo_usuario, created_at')
      .eq('id', usuarioId)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    return {
      sucesso: true,
      usuario: data,
    };
  } catch (erro) {
    console.error('❌ Erro ao buscar usuário:', erro.message);
    return {
      sucesso: false,
      erro: erro.message,
    };
  }
}

/**
 * Testa a conexão com o Supabase
 * @returns {Promise<Object>} Status da conexão
 */
async function testarConexao() {
  try {
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return {
      sucesso: true,
      mensagem: 'Conexão com Supabase estabelecida ✅',
      url: supabaseUrl,
    };
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: 'Erro ao conectar com Supabase ❌',
      erro: erro.message,
    };
  }
}

module.exports = {
  supabase,
  salvarPlanoDeAula,
  buscarPlanosDeAula,
  buscarPlanoPorId,
  deletarPlano,
  registrarHistorico,
  buscarHistorico,
  buscarUsuarioPorId,
  testarConexao,
};
