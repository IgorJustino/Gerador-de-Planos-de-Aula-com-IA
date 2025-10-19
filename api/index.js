// Serverless Function Principal para Vercel
const express = require('express');
const cors = require('cors');
const planoRoutes = require('../src/routes/planoRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Rotas da API (sem prefixo /api porque vercel.json já faz isso)
app.use('/planos', planoRoutes);

// Rota raiz da API
app.get('/', (req, res) => {
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
