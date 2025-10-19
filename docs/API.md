# 📡 Documentação da API

## Base URL
```
http://localhost:3000/api
```

## Autenticação

Todas as rotas (exceto `/health`) requerem autenticação via JWT token no header:

```http
Authorization: Bearer {token}
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

Verifica o status do servidor e conexões.

**Resposta:**
```json
{
  "status": "healthy ✅",
  "timestamp": "2025-10-18T10:30:00.000Z",
  "servicos": {
    "supabase": {
      "status": "conectado ✅",
      "url": "http://127.0.0.1:54321"
    },
    "gemini": {
      "status": "conectado ✅"
    }
  }
}
```

---

### 2. Gerar Plano de Aula

**POST** `/planos/gerar`

Gera um novo plano de aula usando IA.

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "tema": "Fotossíntese",
  "disciplina": "Ciências",
  "nivelEnsino": "Ensino Fundamental II",
  "duracaoMinutos": 50,
  "codigoBNCC": "EF07CI05",
  "observacoes": "Turma com 30 alunos"
}
```

**Resposta (201):**
```json
{
  "sucesso": true,
  "mensagem": "Plano de aula gerado com sucesso! 🎉",
  "planoId": 123,
  "introducaoLudica": "...",
  "objetivoAprendizagem": "...",
  "passoAPasso": "...",
  "rubricaAvaliacao": "...",
  "metadados": {
    "tempoTotalMs": 3500,
    "modeloUsado": "gemini-2.5-flash-preview-05-20",
    "tokensUtilizados": 2500
  }
}
```

**Erros:**
- `400` - Dados inválidos
- `401` - Token não fornecido
- `500` - Erro ao gerar plano

---

### 3. Listar Planos

**GET** `/planos`

Lista todos os planos do usuário autenticado.

**Query Params:**
- `nivelEnsino` (opcional) - Filtrar por nível
- `limite` (opcional) - Número máximo de resultados

**Exemplo:**
```http
GET /planos?nivelEnsino=Ensino Médio&limite=10
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "total": 5,
  "planos": [
    {
      "id": 1,
      "tema": "Fotossíntese",
      "disciplina": "Ciências",
      "nivel_ensino": "Ensino Fundamental II",
      "duracao_minutos": 50,
      "created_at": "2025-10-18T10:00:00.000Z"
    }
  ]
}
```

---

### 4. Buscar Plano por ID

**GET** `/planos/:id`

Retorna um plano específico.

**Resposta (200):**
```json
{
  "sucesso": true,
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

**Erros:**
- `404` - Plano não encontrado

---

### 5. Deletar Plano

**DELETE** `/planos/:id`

Deleta um plano de aula.

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Plano deletado com sucesso"
}
```

**Erros:**
- `404` - Plano não encontrado ou sem permissão

---

### 6. Histórico de Gerações

**GET** `/planos/historico`

Retorna o histórico de gerações do usuário.

**Query Params:**
- `limite` (opcional) - Padrão: 20

**Resposta (200):**
```json
{
  "sucesso": true,
  "total": 15,
  "historico": [
    {
      "id": 1,
      "plano_id": 5,
      "status": "sucesso",
      "modelo_usado": "gemini-2.5-flash",
      "tempo_execucao_ms": 3200,
      "created_at": "2025-10-18T10:00:00.000Z"
    }
  ]
}
```

---

## Códigos de Status

- `200` - OK
- `201` - Criado
- `400` - Requisição inválida
- `401` - Não autorizado
- `404` - Não encontrado
- `500` - Erro do servidor
- `503` - Serviço indisponível

## Rate Limiting

Atualmente não há rate limiting implementado.

## Exemplos com cURL

### Gerar Plano
```bash
curl -X POST http://localhost:3000/api/planos/gerar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tema": "Sistema Solar",
    "nivelEnsino": "Ensino Fundamental I",
    "duracaoMinutos": 50
  }'
```

### Listar Planos
```bash
curl http://localhost:3000/api/planos \
  -H "Authorization: Bearer YOUR_TOKEN"
```
