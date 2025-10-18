// ========================================
// SERVIDOR EXPRESS - Gerador de Planos de Aula
// ========================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const planoRoutes = require('./routes/planoRoutes');
const geminiService = require('./services/geminiService');
const supabaseService = require('./services/supabaseService');

// ========================================
// CONFIGURAÇÃO DO SERVIDOR
// ========================================

const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ========================================
// ROTAS
// ========================================

// Rota de documentação da API (JSON)
app.get('/api', (req, res) => {
  res.json({
    mensagem: '🎓 API Gerador de Planos de Aula com IA',
    versao: '1.0.0',
    status: 'online ✅',
    endpoints: {
      health: 'GET /health',
      gerarPlano: 'POST /api/planos/gerar',
      listarPlanos: 'GET /api/planos?usuarioId=xxx',
      buscarPlano: 'GET /api/planos/:id',
      deletarPlano: 'DELETE /api/planos/:id',
      historico: 'GET /api/planos/historico/:usuarioId',
    },
    documentacao: {
      swagger: 'Em breve 📚',
      github: 'https://github.com/UnBArqDsw2025-2-Turma02/2025.2_T02_G6_AquiTemFCTE_Entrega_03',
    },
  });
});

// Health check (verifica conexões com Supabase e Gemini)
app.get('/health', async (req, res) => {
  try {
    const [supabaseStatus, geminiStatus] = await Promise.all([
      supabaseService.testarConexao(),
      geminiService.testarConexao(),
    ]);

    const todosOk = supabaseStatus.sucesso && geminiStatus.sucesso;

    res.status(todosOk ? 200 : 503).json({
      status: todosOk ? 'healthy ✅' : 'unhealthy ❌',
      timestamp: new Date().toISOString(),
      servicos: {
        supabase: {
          status: supabaseStatus.sucesso ? 'conectado ✅' : 'erro ❌',
          url: supabaseStatus.url || 'N/A',
          mensagem: supabaseStatus.mensagem,
        },
        gemini: {
          status: geminiStatus.sucesso ? 'conectado ✅' : 'erro ❌',
          mensagem: geminiStatus.mensagem,
        },
      },
    });
  } catch (erro) {
    res.status(503).json({
      status: 'unhealthy ❌',
      erro: erro.message,
    });
  }
});

// Rotas de planos de aula
app.use('/api/planos', planoRoutes);

// ========================================
// TRATAMENTO DE ERROS
// ========================================

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada 🔍',
    path: req.path,
    sugestao: 'Veja a lista de endpoints em GET /',
  });
});

// Erro global
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);

  res.status(err.status || 500).json({
    erro: 'Erro interno do servidor',
    mensagem: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

async function iniciarServidor() {
  try {
    console.log('🚀 Iniciando servidor...\n');

    // Verificar variáveis de ambiente
    const variaveisObrigatorias = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'GEMINI_API_KEY',
    ];

    const variaveisFaltando = variaveisObrigatorias.filter(
      (v) => !process.env[v]
    );

    if (variaveisFaltando.length > 0) {
      console.error('❌ ERRO: Variáveis de ambiente faltando no .env:');
      variaveisFaltando.forEach((v) => console.error(`   - ${v}`));
      console.error('\n💡 Copie o arquivo .env.example para .env e configure-o.\n');
      process.exit(1);
    }

    // Testar conexões
    console.log('🔌 Testando conexões...\n');

    const [supabaseStatus, geminiStatus] = await Promise.all([
      supabaseService.testarConexao(),
      geminiService.testarConexao(),
    ]);

    console.log(`📦 Supabase: ${supabaseStatus.mensagem}`);
    if (supabaseStatus.url) {
      console.log(`   URL: ${supabaseStatus.url}`);
    }

    console.log(`🤖 Gemini AI: ${geminiStatus.mensagem}\n`);

    if (!supabaseStatus.sucesso || !geminiStatus.sucesso) {
      console.error('⚠️ ATENÇÃO: Alguns serviços não estão respondendo.');
      console.error('   O servidor vai iniciar, mas pode ter funcionalidades limitadas.\n');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Servidor rodando com sucesso!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 Documentação: http://localhost:${PORT}/`);
      console.log(`🗄️ Supabase Studio: http://127.0.0.1:54323`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('💡 Dica: Use Ctrl+C para parar o servidor\n');
    });
  } catch (erro) {
    console.error('❌ Erro fatal ao iniciar servidor:', erro.message);
    process.exit(1);
  }
}

// Tratamento de sinais de encerramento
process.on('SIGINT', () => {
  console.log('\n\n🛑 Servidor encerrado pelo usuário (Ctrl+C)');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Servidor encerrado (SIGTERM)');
  process.exit(0);
});

// Iniciar!
iniciarServidor();
