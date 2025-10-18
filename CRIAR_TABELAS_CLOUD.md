# 🚀 GUIA RÁPIDO: Criar Tabelas no Supabase Cloud

## ❌ Problema Atual
```
Erro: Could not find the table 'public.usuarios' in the schema cache
```

**Causa:** As tabelas não existem no seu banco de dados Supabase Cloud (apenas no local).

---

## ✅ SOLUÇÃO MAIS SIMPLES (Recomendada)

### Passo 1: Acesse o SQL Editor
1. Vá para: https://app.supabase.com
2. Selecione seu projeto: **anstiasaorbnvllgnvac**
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"+ New query"**

### Passo 2: Cole o SQL
Abra o arquivo no seu projeto:
```
supabase/migrations/20251018040000_criar_tabelas_cloud.sql
```

**Copie TODO o conteúdo** e cole no SQL Editor do Supabase.

### Passo 3: Execute
1. Clique no botão **"RUN"** (ou pressione Ctrl+Enter)
2. Aguarde alguns segundos
3. Você verá: ✅ **"Success. No rows returned"**

### Passo 4: Confirme
1. Vá em **"Table Editor"** no menu lateral
2. Verifique se as 3 tabelas aparecem:
   - ✅ `usuarios`
   - ✅ `planos_aula`
   - ✅ `historico_geracoes`

---

## 🎯 Teste Final

Depois de criar as tabelas:

1. **Acesse seu site hospedado:**
   ```
   https://seu-projeto.vercel.app/login.html
   ```

2. **Crie uma conta:**
   - Nome: Teste
   - Email: teste@exemplo.com
   - Senha: teste123

3. **Faça login e gere um plano:**
   - Tema: "Sistema Solar"
   - Nível: Ensino Fundamental I
   - Duração: 50 minutos

4. **Verifique no Supabase:**
   - Vá em Table Editor → `usuarios` (deve ter 1 usuário)
   - Vá em Table Editor → `planos_aula` (deve ter 1 plano)

---

## 🛠️ SOLUÇÃO ALTERNATIVA (Via Terminal)

Se preferir usar o terminal:

```bash
./aplicar-tabelas-cloud.sh
```

Você precisará fornecer a **String de Conexão** do Supabase:
1. Project Settings → Database → Connection string (Transaction mode)
2. Substitua `[YOUR-PASSWORD]` pela senha real

---

## 📋 Resumo das Tabelas Criadas

### `usuarios`
- Armazena dados dos professores/usuários
- Integra com Supabase Auth
- Políticas RLS: usuários só veem seus próprios dados

### `planos_aula`
- Armazena planos gerados pela IA
- Campos: tema, disciplina, nível, duração, código BNCC
- Conteúdo: introdução, objetivo, passo a passo, rubrica

### `historico_geracoes`
- Log de todas as gerações (sucesso/erro)
- Útil para análise e debugging

---

## ⚠️ Se Ainda Der Erro

### Erro: "duplicate key value violates unique constraint"
**Causa:** Tabela já existe  
**Solução:** Ignore, está tudo OK!

### Erro: "permission denied"
**Causa:** Políticas RLS muito restritivas  
**Solução:** Já incluí política `usuarios_insert_self` no SQL

### Erro: "relation already exists"
**Causa:** Tabela já foi criada antes  
**Solução:** Tudo certo! Só teste o site.

---

## 🎉 Após Aplicar

Seu sistema estará 100% funcional:
- ✅ Login/Registro funcionando
- ✅ Geração de planos salvando no banco
- ✅ Histórico sendo registrado
- ✅ RLS protegendo dados dos usuários

---

## 📞 Precisa de Ajuda?

Se encontrar algum erro ao executar o SQL, copie a mensagem de erro completa e me envie que eu resolvo!
