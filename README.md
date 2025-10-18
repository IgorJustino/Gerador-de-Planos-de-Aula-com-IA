# 🎓 Gerador de Planos de Aula com IA

> Sistema automatizado para criação de planos de aula personalizados usando **Google Gemini AI** e **Supabase**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blue.svg)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#️-configuração)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Banco de Dados](#️-banco-de-dados)
- [Contribuição](#-contribuição)

---

## 🎯 Sobre o Projeto

Este sistema foi desenvolvido para automatizar a criação de **planos de aula pedagógicos** completos e alinhados à **BNCC** (Base Nacional Comum Curricular), utilizando inteligência artificial.

### ✨ Funcionalidades

- ✅ **Geração automática** de planos de aula com IA (Google Gemini)
- ✅ **4 seções obrigatórias**:
  - 📖 Introdução Lúdica (criativa e engajante)
  - 🎯 Objetivo de Aprendizagem (alinhado à BNCC)
  - 📝 Passo a Passo da Atividade (roteiro detalhado)
  - ✍️ Rubrica de Avaliação (critérios de aprendizagem)
- ✅ **Armazenamento no Supabase** (PostgreSQL)
- ✅ **Histórico de gerações** (sucesso/erro)
- ✅ **API RESTful** completa
- ✅ **Configuração via .env**

---

## 🛠 Tecnologias

| Tecnologia | Finalidade |
|------------|------------|
| **Node.js** | Backend JavaScript |
| **Express.js** | Framework web |
| **Supabase** | Banco de dados (PostgreSQL) + Auth |
| **Google Gemini AI** | Geração de texto com IA |
| **dotenv** | Gerenciamento de variáveis de ambiente |
| **axios** | Requisições HTTP |

---

## 📦 Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** >= 18.x → [Download](https://nodejs.org/)
- **npm** ou **yarn**
- **Docker** (para Supabase local) → [Download](https://www.docker.com/)
- **Supabase CLI** → [Instalação](https://supabase.com/docs/guides/cli)
  ```bash
  curl -fsSL https://cli.supabase.com/install/linux | sh
  ```
- **Git** → [Download](https://git-scm.com/)

---

## 🚀 Instalação

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/UnBArqDsw2025-2-Turma02/2025.2_T02_G6_AquiTemFCTE_Entrega_03.git
cd gerador
```

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Inicie o Supabase local

```bash
supabase start
```

Após a inicialização, você verá:
```
API URL: http://127.0.0.1:54321
Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
```

### 4️⃣ Configure as variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
touch .env
```

Adicione o seguinte conteúdo:

```env
# SUPABASE
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# GEMINI AI
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-1.5-flash

# SERVIDOR
PORT=3000
NODE_ENV=development
```

**📍 Como obter a chave do Gemini:**
1. Acesse: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Clique em **"Get API Key"**
3. Copie e cole no `.env`

### 5️⃣ Inicie o servidor

```bash
npm start
```

Você verá:
```
✅ Servidor rodando com sucesso!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://localhost:3000
🌐 Health Check: http://localhost:3000/health
🗄️ Supabase Studio: http://127.0.0.1:54323
```

---

## ⚙️ Configuração

### Modelos Gemini Disponíveis

| Modelo | Velocidade | Qualidade | Custo (gratuito) |
|--------|------------|-----------|------------------|
| `gemini-1.5-flash` | ⚡ Rápido | ✅ Boa | Até 15 req/min |
| `gemini-1.5-pro` | 🐢 Lento | ⭐ Excelente | Até 2 req/min |

Altere no `.env`:
```env
GEMINI_MODEL=gemini-1.5-pro
```

---

## 💻 Uso

### 1️⃣ Testar a API

Acesse no navegador:
```
http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "healthy ✅",
  "servicos": {
    "supabase": { "status": "conectado ✅" },
    "gemini": { "status": "conectado ✅" }
  }
}
```

### 2️⃣ Gerar um plano de aula

Use **Postman**, **Insomnia** ou **curl**:

```bash
curl -X POST http://localhost:3000/api/planos/gerar \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "123e4567-e89b-12d3-a456-426614174000",
    "tema": "Fotossíntese",
    "nivelEnsino": "Ensino Fundamental I",
    "duracaoMinutos": 50,
    "codigoBNCC": "EF05CI05",
    "observacoes": "Turma com 25 alunos"
  }'
```

Resposta:
```json
{
  "sucesso": true,
  "mensagem": "Plano de aula gerado com sucesso! 🎉",
  "plano": {
    "id": 1,
    "tema": "Fotossíntese",
    "introducao_ludica": "...",
    "objetivo_aprendizagem": "...",
    "passo_a_passo": "...",
    "rubrica_avaliacao": "..."
  }
}
```

---

## 📡 API Endpoints

### **Informações Gerais**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Informações da API |
| `GET` | `/health` | Status dos serviços |

### **Planos de Aula**

| Método | Endpoint | Descrição | Body |
|--------|----------|-----------|------|
| `POST` | `/api/planos/gerar` | Gera novo plano | `{ usuarioId, tema, nivelEnsino, duracaoMinutos, codigoBNCC?, observacoes? }` |
| `GET` | `/api/planos?usuarioId=xxx` | Lista planos do usuário | - |
| `GET` | `/api/planos/:id` | Busca plano específico | - |
| `DELETE` | `/api/planos/:id` | Deleta um plano | `{ usuarioId }` |
| `GET` | `/api/planos/historico/:usuarioId` | Histórico de gerações | - |

### Exemplo de Requisição Completa

```javascript
fetch('http://localhost:3000/api/planos/gerar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuarioId: '550e8400-e29b-41d4-a716-446655440000',
    tema: 'Ciclo da Água',
    nivelEnsino: 'Ensino Fundamental I',
    duracaoMinutos: 45,
    codigoBNCC: 'EF04CI02',
    observacoes: 'Aula prática com experimento'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📂 Estrutura do Projeto

```
gerador/
├── src/
│   ├── routes/
│   │   └── planoRoutes.js      # Rotas da API
│   ├── services/
│   │   ├── geminiService.js    # Integração Gemini AI
│   │   └── supabaseService.js  # Integração Supabase
│   └── server.js               # Servidor Express
├── supabase/
│   ├── migrations/
│   │   └── 20251017205334_criar_tabelas_sistema.sql
│   ├── seed.sql                # Dados iniciais
│   └── config.toml             # Configuração Supabase
├── .env                        # Variáveis de ambiente (NÃO COMMITAR!)
├── .env.example                # Exemplo de configuração
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Banco de Dados

### Diagrama ER (Simplificado)

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│  usuarios   │───┬───│  planos_aula     │       │ historico_geracoes  │
├─────────────┤   │   ├──────────────────┤       ├─────────────────────┤
│ id (UUID)   │   │   │ id (bigint)      │   ┌───│ id (bigint)         │
│ nome        │   └───│ usuario_id (FK)  │───┘   │ usuario_id (FK)     │
│ email       │       │ tema             │       │ plano_id (FK)       │
│ senha_hash  │       │ nivel_ensino     │       │ input_json          │
│ tipo_usuario│       │ duracao_minutos  │       │ status              │
└─────────────┘       │ introducao_ludica│       │ mensagem_erro       │
                       │ objetivo_aprend. │       │ tempo_execucao_ms   │
                       │ passo_a_passo    │       └─────────────────────┘
                       │ rubrica_avaliacao│
                       └──────────────────┘
```

### Tabelas Principais

1. **usuarios** - Professores e administradores
2. **planos_aula** - Planos gerados pela IA
3. **historico_geracoes** - Log de todas as gerações (sucesso/erro)

---

## 🧪 Testes

### Teste rápido com curl

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Gerar plano
curl -X POST http://localhost:3000/api/planos/gerar \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"550e8400-e29b-41d4-a716-446655440000","tema":"Frações","nivelEnsino":"Ensino Fundamental I","duracaoMinutos":50}'

# 3. Listar planos
curl "http://localhost:3000/api/planos?usuarioId=550e8400-e29b-41d4-a716-446655440000"
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

**Equipe G6 - AquiTemFCTE**
- UnB - Universidade de Brasília
- Disciplina: Arquitetura e Desenho de Software
- Turma: 2025.2 - T02

---

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Gemini AI](https://ai.google.dev/docs)
- [BNCC - Base Nacional Comum Curricular](http://basenacionalcomum.mec.gov.br/)
- [Express.js](https://expressjs.com/)

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão?

- Abra uma [Issue](https://github.com/UnBArqDsw2025-2-Turma02/2025.2_T02_G6_AquiTemFCTE_Entrega_03/issues)
- Envie um e-mail para: suporte@projeto.com

---

<div align="center">

**Feito com ❤️ e IA 🤖**

⭐ Se este projeto foi útil, deixe uma estrela no repositório!

</div>
