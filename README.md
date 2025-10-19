# Gerador de Planos de Aula com IA

![Gerador de planos](docs/assets/geradordeplanos.png)

**O projeto consiste em um sistema capaz de gerar planos de aula personalizados utilizando Inteligência Artificial (Google Gemini), armazenando os resultados no Supabase e alinhando o conteúdo à Base Nacional Comum Curricular (BNCC). O objetivo é apoiar professores no processo de planejamento pedagógico, fornecendo planos estruturados contendo introdução lúdica, objetivos educacionais, roteiros de atividade e rubricas de avaliação.**

**Plano gerado: exibe o resultado da IA dividido em seções — introdução lúdica, objetivo de aprendizagem, passo a passo da atividade e rubrica de avaliação — conforme o retorno estruturado do modelo Gemini**
![Gerador de planos](docs/assets/pag2.png)

**Histórico de planos: mostra os planos de aula já criados pelo usuário, armazenados no Supabase, com opções para visualizar ou deletar. Essa funcionalidade garante organização e fácil acesso aos planos anteriores.**

![planos anteriores](docs/assets/telafinal.png)

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Supabase JS Client** - Cliente do Supabase
- **Google Generative AI** - SDK do Gemini

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização
- **JavaScript (Vanilla)** - Interatividade
- **Supabase Auth** - Autenticação

### Banco de Dados
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** - Segurança
- **Triggers e Views** - Otimizações

### IA
- **Google Gemini 2.5 Flash** - Geração de conteúdo

### Modelo de IA Utilizado

Após análise da documentação do Google AI Studio, foi selecionado o modelo:

**gemini-2.5-flash-preview-05-20**

Motivos da escolha:

- Baixa latência e alta velocidade de resposta
- Excelente para prompts estruturados e JSON
- Treinado em contexto educacional e linguagem natural
- Ideal para respostas textuais criativas, como introduções lúdicas e roteiros de aula

##  Como Instalar / Rodar

### Pré-requisitos
- Node.js 18+ instalado
- Docker instalado (para Supabase local)
- Conta no Google Cloud (para Gemini API)

### 1. Clone o repositório
```bash
git clone https://github.com/IgorJustino/Gerador-de-Planos.git
cd Gerador-de-Planos
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase local
```bash
npx supabase start
```

### 4. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto (veja seção abaixo).

### 5. Rode o servidor
```bash
npm start
```

### 6. Acesse a aplicação
Abra no navegador: `http://localhost:3000`

## Como Configurar .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# SUPABASE LOCAL (desenvolvimento)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# GOOGLE GEMINI
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash-preview-05-20

# SERVIDOR
PORT=3000
NODE_ENV=development
```

### Como obter as credenciais:

**Gemini API Key:**
1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crie uma nova API Key
3. Copie e cole em `GEMINI_API_KEY`

**Supabase (Produção):**
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em Project Settings → API
3. Copie a URL e a `anon` key

## 📝 Comandos Básicos

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm start

# Rodar com auto-reload (nodemon)
npm run dev

# Iniciar Supabase local
npx supabase start

# Parar Supabase local
npx supabase stop

# Resetar banco de dados
npx supabase db reset

# Aplicar migrações
npx supabase db push

# Ver logs do Supabase
npx supabase status
```

## 🌐 Links do Projeto

- **Repositório GitHub:** [github.com/IgorJustino/Gerador-de-Planos](https://github.com/IgorJustino/Gerador-de-Planos)
- **Supabase Cloud:** [anstiasaorbnvllgnvac.supabase.co](https://anstiasaorbnvllgnvac.supabase.co)
- **Deploy (Vercel):** *https://gerador-de-planos.vercel.app/login.html*

