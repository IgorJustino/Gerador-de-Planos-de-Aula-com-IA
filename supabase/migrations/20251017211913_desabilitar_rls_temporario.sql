-- Desabilitar RLS temporariamente para permitir uso sem autenticação

-- Remover RLS da tabela planos_aula
ALTER TABLE planos_aula DISABLE ROW LEVEL SECURITY;

-- Remover RLS da tabela historico_geracoes  
ALTER TABLE historico_geracoes DISABLE ROW LEVEL SECURITY;

-- Remover RLS da tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
