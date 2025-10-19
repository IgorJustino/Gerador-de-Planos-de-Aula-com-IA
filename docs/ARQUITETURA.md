### 1. Frontend (`/public`)

**Responsabilidades:**
- Interface do usuário
- Validação de formulários
- Comunicação com Supabase Auth
- Chamadas HTTP para o backend

**Arquivos principais:**
- `index.html` - Dashboard principal
- `login.html` - Autenticação
- `js/app.js` - Lógica da aplicação
- `js/auth.js` - Autenticação
- `css/styles.css` - Estilos principais

### 2. Backend (`/src`)

**Responsabilidades:**
- API REST
- Integração com Gemini AI
- Validação de dados
- Gerenciamento de sessões
- Persistência de dados


## Fluxo de Dados

### 1. Registro de Usuário
```
Frontend → Supabase Auth (signUp)
         → Backend → Supabase DB (insert usuarios)
```

### 2. Login
```
Frontend → Supabase Auth (signInWithPassword)
         → Retorna JWT token
         → Frontend armazena token
```

### 3. Geração de Plano
```
Frontend → Backend (/api/planos/gerar)
         → Valida token JWT
         → Gemini AI (gera conteúdo)
         → Supabase DB (salva plano)
         → Retorna plano para Frontend
```

## Segurança

### Row Level Security (RLS)
- Usuários só veem seus próprios dados
- Políticas definidas no Supabase
- Validação adicional no backend

### Autenticação
- JWT tokens via Supabase Auth
- Middleware de autenticação em todas as rotas protegidas
- Tokens armazenados no localStorage (frontend)

## Performance

### Otimizações Implementadas
- Índices em colunas frequentemente consultadas
- Views materializadas para estatísticas
- Triggers para atualizações automáticas
- Cache de sessões
