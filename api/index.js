// Serverless Function Principal para Vercel
const express = require('express');
const cors = require('cors');
const planoRoutes = require('../src/routes/planoRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} | Path: ${req.path}`);
  next();
});

// Rotas da API
// A Vercel passa /api/planos/gerar como /api/planos/gerar
// Então precisamos montar as rotas considerando o /api
app.use('/api/planos', planoRoutes);

// Rota raiz da API
app.get('/api', (req, res) => {
  res.json({
    mensagem: '🎓 API Gerador de Planos de Aula',
    status: 'online ✅',
    endpoints: {
      gerarPlano: 'POST /api/planos/gerar',
      listarPlanos: 'GET /api/planos',
      buscarPlano: 'GET /api/planos/:id',
      deletarPlano: 'DELETE /api/planos/:id',
    },
  });
});

// Rota catch-all para debug
app.all('*', (req, res) => {
  console.log(`⚠️ Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).json({
    erro: 'Rota não encontrada',
    metodo: req.method,
    url: req.url,
    path: req.path,
    dica: 'Verifique se você está usando o endpoint correto: POST /api/planos/gerar',
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(err.status || 500).json({
    erro: 'Erro interno do servidor',
    mensagem: err.message,
  });
});

// Exportar para Vercel
module.exports = app;
