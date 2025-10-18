#!/bin/bash

# ========================================
# SCRIPT: Aplicar tabelas no Supabase Cloud
# ========================================

echo "🚀 Aplicando tabelas no Supabase Cloud..."
echo ""
echo "📋 Este script vai criar as tabelas:"
echo "   - public.usuarios"
echo "   - public.planos_aula"
echo "   - public.historico_geracoes"
echo ""
echo "⚠️  ATENÇÃO: Você precisa da STRING DE CONEXÃO do seu projeto Supabase."
echo ""
echo "🔗 Para obter a string de conexão:"
echo "   1. Acesse: https://app.supabase.com"
echo "   2. Vá em: Project Settings → Database"
echo "   3. Copie a 'Connection string' (modo Transaction)"
echo "   4. Substitua [YOUR-PASSWORD] pela sua senha real"
echo ""
read -p "Cole aqui a STRING DE CONEXÃO (ou pressione CTRL+C para cancelar): " CONNECTION_STRING

if [ -z "$CONNECTION_STRING" ]; then
    echo "❌ Erro: String de conexão não fornecida."
    exit 1
fi

echo ""
echo "📄 Aplicando SQL da migração..."
echo ""

# Aplicar o SQL usando psql
psql "$CONNECTION_STRING" -f supabase/migrations/20251018040000_criar_tabelas_cloud.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tabelas criadas com sucesso no Supabase Cloud!"
    echo ""
    echo "🎉 Agora você pode:"
    echo "   1. Acessar seu site hospedado"
    echo "   2. Criar uma conta em /login.html"
    echo "   3. Gerar planos de aula"
    echo ""
else
    echo ""
    echo "❌ Erro ao aplicar SQL. Verifique:"
    echo "   - A string de conexão está correta?"
    echo "   - Você tem psql instalado? (sudo apt install postgresql-client)"
    echo "   - Sua senha está correta?"
    echo ""
fi
