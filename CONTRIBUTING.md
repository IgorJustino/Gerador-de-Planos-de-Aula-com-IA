# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Gerador de Planos de Aula! Este documento fornece diretrizes para contribuições.

---

## 📋 Índice

1. [Configuração do Ambiente](#-configuração-do-ambiente)
2. [Estrutura do Projeto](#-estrutura-do-projeto)
3. [Convenções de Código](#-convenções-de-código)
4. [Processo de Desenvolvimento](#-processo-de-desenvolvimento)
5. [Testes](#-testes)
6. [Commits](#-commits)

---

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 22.x (via NVM recomendado)
- Docker (para Supabase local)
- Supabase CLI
- Git

### Setup Inicial

```bash
# 1. Clone o repositório
git clone https://github.com/IgorJustino/Gerador-de-Planos.git
cd gerador

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env e adicione sua chave Gemini

# 4. Inicie Supabase local
supabase start
supabase db reset

# 6. Inicie o servidor
npm start
```

---

## 📁 Estrutura do Projeto

```
gerador/
├── docs/              # Documentação técnica
├── public/            # Frontend estático
│   ├── css/          # Estilos CSS
│   ├── js/           # Scripts JavaScript
│   └── *.html        # Páginas HTML
├── src/              # Backend Node.js
│   ├── middleware/   # Express middlewares
│   ├── routes/       # Rotas da API
│   ├── services/     # Lógica de negócio
│   └── server.js     # Servidor principal
├── supabase/         # Configuração do banco
│   ├── migrations/   # Migrations SQL
│   └── seed*.sql     # Dados iniciais
└── *.md              # Documentação
```

---

## 💻 Convenções de Código

### JavaScript (Backend e Frontend)

```javascript
// ✅ BOM: camelCase para variáveis e funções
const nomeUsuario = 'João';
function calcularTotal() { }

// ✅ BOM: PascalCase para classes
class GeradorPlano { }

// ✅ BOM: UPPER_SNAKE_CASE para constantes
const API_URL = 'http://localhost:3000';

// ✅ BOM: Comentários descritivos
// ========================================
// AUTENTICAÇÃO
// ========================================

// ❌ RUIM: snake_case em JavaScript
const nome_usuario = 'João';
```

### SQL

```sql
-- ✅ BOM: snake_case para tabelas e colunas
CREATE TABLE planos_aula (
  id bigint PRIMARY KEY,
  usuario_id uuid NOT NULL
);

-- ✅ BOM: lowercase para keywords
select * from usuarios where id = 1;

-- ❌ RUIM: camelCase em SQL
CREATE TABLE planosAula (...)
```

### CSS

```css
/* ✅ BOM: kebab-case para classes */
.plano-item { }
.btn-primary { }

/* ❌ RUIM: camelCase em CSS */
.planoItem { }
```

---

## 🔄 Processo de Desenvolvimento

### 1. Crie uma Branch

```bash
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 2. Desenvolva

- Faça commits pequenos e frequentes
- Teste localmente antes de commitar
- Mantenha o código limpo e comentado

### 3. Teste

```bash
# Teste o servidor
npm start

# Teste no navegador
# http://localhost:3000

# Verifique o banco
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 4. Push e Pull Request

```bash
git push origin feature/nome-da-feature
```

Abra um Pull Request no GitHub com:
- Descrição clara do que foi feito
- Screenshots (se aplicável)
- Referência a issues relacionadas

---

## ✅ Testes

### Checklist Manual

Antes de fazer commit, verifique:

- [ ] Servidor inicia sem erros (`npm start`)
- [ ] Login funciona
- [ ] Geração de plano funciona
- [ ] Planos são salvos no banco
- [ ] Listagem de planos funciona
- [ ] Deleção de planos funciona
- [ ] Validações estão funcionando
- [ ] Não há erros no console do navegador
- [ ] Código está comentado
- [ ] README atualizado (se necessário)

### Testes de Integração

```bash
# Teste health check
curl http://localhost:3000/health

# Teste autenticação
# (via frontend ou Postman)

# Verifique banco
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "SELECT COUNT(*) FROM planos_aula;"
```

---

## 📝 Commits

### Formato de Commit Messages

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição curta

[corpo opcional]

[footer opcional]
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Apenas documentação
- `style`: Formatação, ponto e vírgula, etc.
- `refactor`: Refatoração de código
- `test`: Adição de testes
- `chore`: Tarefas de manutenção

**Exemplos:**

```bash
# ✅ BOM
git commit -m "feat(frontend): adiciona visualização de planos anteriores"
git commit -m "fix(auth): corrige erro de token expirado"
git commit -m "docs(readme): atualiza instruções de instalação"

# ❌ RUIM
git commit -m "mudanças"
git commit -m "fix"
git commit -m "WIP"
```

---

## 🐛 Reportando Bugs

Ao reportar um bug, inclua:

1. **Descrição clara** do problema
2. **Passos para reproduzir**
3. **Comportamento esperado**
4. **Comportamento atual**
5. **Screenshots** (se aplicável)
6. **Ambiente**:
   - SO
   - Versão Node.js
   - Navegador

**Template:**

```markdown
## Descrição
[Descreva o bug]

## Passos para Reproduzir
1. Vá para...
2. Clique em...
3. Veja o erro...

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está acontecendo]

## Screenshots
[Se aplicável]

## Ambiente
- SO: Ubuntu 22.04
- Node.js: v22.0.0
- Navegador: Chrome 120
```

---

## 💡 Sugerindo Features

Ao sugerir uma nova funcionalidade:

1. **Verifique** se já não existe issue aberta
2. **Descreva** claramente a feature
3. **Justifique** por que seria útil
4. **Proponha** uma implementação (opcional)

---

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Gemini AI](https://ai.google.dev/docs)
- [Express.js](https://expressjs.com/)
- [BNCC](http://basenacionalcomum.mec.gov.br/)

---

## ❓ Dúvidas?

- Consulte a [documentação](./docs/)
- Abra uma issue
- Entre em contato com os mantenedores

---

**Obrigado por contribuir! 🎉**
