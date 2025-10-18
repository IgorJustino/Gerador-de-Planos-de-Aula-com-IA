// ========================================
// MIDDLEWARE: Autenticação JWT com Supabase
// ========================================

const { supabase } = require('../services/supabaseService');

/**
 * Middleware para verificar e autenticar o token JWT
 * O token é extraído do header Authorization
 * O Supabase Client é configurado para usar esse token
 */
async function authenticateToken(req, res, next) {
  try {
    // 1️⃣ Extrair token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Token de autenticação não fornecido',
      });
    }

    // 2️⃣ Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('❌ Erro ao verificar token:', error);
      return res.status(401).json({
        sucesso: false,
        erro: 'Token inválido ou expirado',
      });
    }

    // 3️⃣ Criar cliente Supabase autenticado para esta requisição
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAuth = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    req.supabaseAuth = supabaseAuth;
    
    // 4️⃣ Buscar dados do usuário na tabela usuarios usando o cliente autenticado
    const { data: userData, error: userError } = await supabaseAuth
      .from('usuarios')
      .select('*')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      console.warn('⚠️ Usuário autenticado mas não existe na tabela usuarios');
      console.warn('⚠️ Erro ao buscar:', userError);
      
      // Criar usuário automaticamente
      const { data: newUser, error: createError } = await supabaseAuth
        .from('usuarios')
        .insert([{
          nome: user.email.split('@')[0],
          email: user.email,
          papel: 'professor'
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError);
        return res.status(500).json({
          sucesso: false,
          erro: 'Erro ao criar registro de usuário',
        });
      }

      req.user = newUser;
      req.authUser = user;
      req.token = token;
      
      console.log(`✅ Usuário criado e autenticado: ${user.email} (ID: ${newUser.id})`);
    } else {
      req.user = userData;
      req.authUser = user;
      req.token = token;
      
      console.log(`✅ Usuário autenticado: ${user.email} (ID: ${userData.id})`);
    }
    next();

  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno ao verificar autenticação',
    });
  }
}

/**
 * Middleware opcional - permite requisições sem autenticação
 * mas configura o contexto se o token estiver presente
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Sem token, continua sem autenticação
    return next();
  }

  // Com token, tenta autenticar mas não bloqueia se falhar
  try {
    await authenticateToken(req, res, next);
  } catch (error) {
    console.warn('⚠️ Erro ao autenticar token opcional:', error);
    next();
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
};
