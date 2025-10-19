// Arquivo principal para Vercel - Serverless Function Handler
const app = require('./api/index.js');

// Vercel precisa de uma função handler
module.exports = app;
