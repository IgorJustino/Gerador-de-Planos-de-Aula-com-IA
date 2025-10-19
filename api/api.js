// SERVIDOR EXPRESS PARA VERCEL (Serverless)
// Adaptado de src/server.js para rodar como Serverless Function

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const planoRoutes = require('../src/routes/planoRoutes');
const geminiService = require('../src/services/geminiService');
const supabaseService = require('../src/services/supabaseService');
const path = require('path');

// Criar app Express (SEM .listen() - Vercel cuida disso)
const app = express();

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

// ROTAS

// Rota principal da API
app.get('/', (req, res) => {
  res.json({
    mensagem: '🎓 API Gerador de Planos de Aula com IA',
    versao: '1.0.0',
    status: 'online ✅',
    ambiente: 'Vercel Serverless',
    endpoints: {
      health: 'GET /api/health',
      gerarPlano: 'POST /api/planos/gerar',
      listarPlanos: 'GET /api/planos?usuarioId=xxx',
      buscarPlano: 'GET /api/planos/:id',
      deletarPlano: 'DELETE /api/planos/:id',
      historico: 'GET /api/planos/historico/:usuarioId',
    },
    documentacao: {
      github: 'https://github.com/IgorJustino/Gerador-de-Planos',
    },
  });
});

// Health check
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

// Rotas de planos de aula (SEM o prefixo /api porque o vercel.json já faz isso)
app.use('/planos', planoRoutes);

// TRATAMENTO DE ERROS

// Rota não encontrada
app.use((req, res, next) => {
  // Se for requisição de API, retorna JSON
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      erro: 'Rota não encontrada 🔍',
      path: req.path,
      sugestao: 'Veja a lista de endpoints em GET /api',
    });
  } else {
    // Se for página, redireciona para index.html
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
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

// Exportar app para Vercel (NÃO usar .listen())
module.exports = app;
