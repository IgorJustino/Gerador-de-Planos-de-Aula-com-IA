# 🚀 Deploy na Vercel - Guia Completo

## ✅ O que foi corrigido

### Problema identificado:
- ❌ URLs hardcoded para `localhost` no frontend
- ❌ Faltava rota para `/login` no vercel.json
- ❌ Token de autenticação não estava sendo fornecido (sem login)

### Solução implementada:
- ✅ URLs dinâmicas no `app.js` (usa `window.location.origin`)
- ✅ Supabase Cloud configurado em `app.js` e `auth.js`
- ✅ Rota `/login` adicionada ao `vercel.json`
- ✅ Arquivo `api/index.js` criado para serverless functions

---

## 📋 Checklist de Deploy

### 1️⃣ Verificar Credenciais no Vercel Dashboard

Vá em **Settings → Environment Variables** e adicione:

```env
SUPABASE_URL=https://anstiasaorbnvllgnvac.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuc3RpYXNhb3JibnZsbGdudmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODY5MjcsImV4cCI6MjA3NjM2MjkyN30.rBcXFZT8G924D-OSXlykClOCPKONTJeCe7V7UTz945g
GEMINI_API_KEY=AIzaSyC7VPfEn7W011wUoWnZB1uS1YfvBkR5xKc
GEMINI_MODEL=gemini-2.5-flash-preview-05-20
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Estas variáveis são para o **BACKEND** (API). O frontend já está configurado com Supabase Cloud diretamente em `app.js` e `auth.js`.

---

### 2️⃣ Configurações do Projeto Vercel

No dashboard da Vercel, use estas configurações:

```
Root Directory:        .  (raiz do projeto)
Framework Preset:      Other
Build Command:         (deixe vazio - não há build)
Output Directory:      public
Install Command:       npm install
```

---

### 3️⃣ Redeployar na Vercel

Como você já fez o `git push`, a Vercel vai detectar automaticamente e fazer o redeploy.

**OU** você pode forçar um redeploy:
1. Vá no dashboard da Vercel
2. Clique em **Deployments**
3. Clique nos três pontos (...) do último deploy
4. Clique em **Redeploy**

---

## 🧪 Testar o Deploy

### Passo 1: Testar Health Check
```bash
# Substitua pelo seu domínio Vercel
curl https://seu-projeto.vercel.app/api/health
```

**Resposta esperada:**
```json
{
  "status": "healthy ✅",
  "timestamp": "2025-10-18T...",
  "servicos": {
    "supabase": {
      "status": "conectado ✅",
      "url": "https://anstiasaorbnvllgnvac.supabase.co"
    },
    "gemini": {
      "status": "conectado ✅"
    }
  }
}
```

---

### Passo 2: Testar Login/Registro

1. Acesse `https://seu-projeto.vercel.app/login`
2. Crie uma conta nova
3. Faça login
4. Você deve ser redirecionado para `https://seu-projeto.vercel.app/`

---

### Passo 3: Testar Geração de Plano

1. Preencha o formulário de plano de aula
2. Clique em "Gerar Plano de Aula"
3. Aguarde a resposta da IA

**Se der erro "Token de autenticação não fornecido":**
- Verifique no **Console do Navegador** (F12) se há erros
- Verifique se você está logado (deve aparecer seu email no canto superior direito)
- Faça logout e login novamente

---

## 🐛 Troubleshooting

### ❌ "Token de autenticação não fornecido"

**Causa**: Usuário não está autenticado.

**Solução**:
1. Abra o Console do navegador (F12)
2. Vá em **Application → Local Storage**
3. Verifique se existe `supabase.auth.token`
4. Se não existir, faça login novamente

---

### ❌ "Cannot read property 'access_token' of null"

**Causa**: Sessão expirada ou inválida.

**Solução**:
```javascript
// No Console do navegador (F12)
localStorage.clear();
location.reload();
```

Depois faça login novamente.

---

### ❌ "Failed to fetch" ou "Network Error"

**Causa**: Backend não está respondendo.

**Solução**:
1. Verifique se as variáveis de ambiente estão corretas na Vercel
2. Teste o endpoint: `https://seu-projeto.vercel.app/api/health`
3. Veja os logs na Vercel: **Dashboard → Functions → View Logs**

---

### ❌ Página /login não carrega

**Causa**: Rota não configurada no `vercel.json`.

**Solução**: Já está corrigido! Verifique se o arquivo `vercel.json` tem:
```json
{
  "src": "/login",
  "dest": "public/login.html"
}
```

---

## 📁 Arquivos Importantes Criados/Modificados

### `api/index.js`
- Servidor Express adaptado para Vercel Serverless
- **NÃO** usa `.listen()` (Vercel cuida disso)
- Exporta `module.exports = app`

### `vercel.json`
- Configuração de rotas e builds
- `/api/*` → Serverless functions
- `/login` → `login.html`
- `/*` → `index.html` (SPA fallback)

### `public/js/app.js`
- ✅ API_URL dinâmica: `window.location.origin + '/api/planos/gerar'`
- ✅ Supabase Cloud URL configurada

### `public/js/auth.js`
- ✅ Supabase Cloud URL configurada

---

## 🎯 Próximos Passos

1. ✅ Fazer login na aplicação deployada
2. ✅ Gerar um plano de aula de teste
3. ✅ Verificar se os dados foram salvos no Supabase Cloud
4. 🔄 Configurar domínio customizado (opcional)
5. 🔄 Configurar Analytics (opcional)

---

## 📚 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Cloud**: https://supabase.com/dashboard/project/anstiasaorbnvllgnvac
- **GitHub Repo**: https://github.com/IgorJustino/Gerador-de-Planos
- **Logs da Vercel**: Dashboard → Deployments → [seu deploy] → Function Logs

---

## ✨ Dica Final

Se você quiser testar localmente com as configurações de produção:

1. Crie um arquivo `.env.production`:
```env
SUPABASE_URL=https://anstiasaorbnvllgnvac.supabase.co
SUPABASE_ANON_KEY=eyJ...945g
GEMINI_API_KEY=AIzaSyC7VPfEn7W011wUoWnZB1uS1YfvBkR5xKc
GEMINI_MODEL=gemini-2.5-flash-preview-05-20
```

2. Rode:
```bash
NODE_ENV=production npm start
```

3. Acesse `http://localhost:3000`

Mas lembre-se: o frontend (`app.js` e `auth.js`) está sempre apontando para Supabase Cloud agora!

---

**🎉 Deploy concluído! Seu app está rodando na Vercel!**
