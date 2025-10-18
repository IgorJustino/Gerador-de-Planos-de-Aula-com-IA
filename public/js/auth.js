// ========================================
// CONFIGURAÇÃO SUPABASE
// ========================================

// Supabase Cloud (substitua pelos seus valores de produção)
const SUPABASE_URL = 'https://anstiasaorbnvllgnvac.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuc3RpYXNhb3JibnZsbGdudmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODY5MjcsImV4cCI6MjA3NjM2MjkyN30.rBcXFZT8G924D-OSXlykClOCPKONTJeCe7V7UTz945g';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// ========================================
// VERIFICAR AUTENTICAÇÃO
// ========================================

async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔍 Verificando autenticação na página de login...');
        console.log('📋 Session:', session);
        console.log('📋 Error:', error);
        
        if (session) {
            console.log('✅ Sessão ativa encontrada, redirecionando para index.html');
            window.location.href = 'index.html';
        } else {
            console.log('ℹ️ Sem sessão ativa, usuário pode fazer login');
        }
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Forms
    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('register-form-element').addEventListener('submit', handleRegister);
}

// ========================================
// ALTERNÂNCIA DE ABAS
// ========================================

function switchTab(tabName) {
    // Atualizar tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');

    // Atualizar forms
    document.querySelectorAll('.form-content').forEach(f => f.classList.remove('active'));
    document.getElementById(`${tabName}-form`).classList.add('active');

    hideMessage();
}

// ========================================
// MENSAGENS
// ========================================

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
}

function hideMessage() {
    const messageEl = document.getElementById('message');
    messageEl.style.display = 'none';
}

// ========================================
// LOADING STATE
// ========================================

function setLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span>Processando...';
    } else {
        button.disabled = false;
        button.textContent = originalText;
    }
}

// ========================================
// LOGIN
// ========================================

async function handleLogin(event) {
    event.preventDefault();
    hideMessage();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const button = event.target.querySelector('.submit-btn');

    setLoading(button, true);

    try {
        console.log('🔐 Tentando fazer login com:', email);
        
        // 1. Autenticar no Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        console.log('📋 Resultado signInWithPassword:', { authData, authError });

        if (authError) throw authError;

        console.log('✅ Autenticação bem-sucedida!');
        console.log('📋 Token:', authData.session.access_token.substring(0, 20) + '...');
        console.log('📋 User ID (auth):', authData.user.id);

        // 2. Criar cliente autenticado com o token
        const supabaseAuth = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${authData.session.access_token}`
                }
            }
        });

        console.log('🔍 Buscando dados do usuário na tabela usuarios...');

        // 3. Buscar dados do usuário na tabela usuarios usando cliente autenticado
        let { data: userData, error: userError } = await supabaseAuth
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        console.log('📋 Resultado busca usuarios:', { userData, userError });

        if (userError) {
            console.warn('⚠️ Usuário não encontrado na tabela usuarios, criando...');
            
            // Criar usuário na tabela
            const { data: newUser, error: createError } = await supabaseAuth
                .from('usuarios')
                .insert([
                    {
                        nome: email.split('@')[0],
                        email: email,
                        papel: 'professor'
                    }
                ])
                .select()
                .single();

            console.log('📋 Resultado insert usuarios:', { newUser, createError });

            if (createError) throw createError;
            
            userData = newUser;
        }

        console.log('✅ Dados do usuário obtidos:', userData);

        // 4. Salvar dados no localStorage (usar o ID da tabela usuarios, não do auth)
        localStorage.setItem('supabase_token', authData.session.access_token);
        localStorage.setItem('user_id', userData.id); // ID da tabela usuarios
        localStorage.setItem('user_email', authData.user.email);

        console.log('✅ Dados salvos no localStorage');

        showMessage('Login realizado com sucesso! Redirecionando...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('❌ Erro no login:', error);
        console.error('❌ Detalhes do erro:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            status: error.status
        });
        
        let errorMessage = 'Erro ao fazer login. Tente novamente.';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Confirme seu email antes de fazer login';
        } else if (error.message) {
            errorMessage = `Erro: ${error.message}`;
        }
        
        showMessage(errorMessage, 'error');
        setLoading(button, false, 'Entrar');
    }
}

// ========================================
// REGISTRO
// ========================================

async function handleRegister(event) {
    event.preventDefault();
    hideMessage();

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const button = event.target.querySelector('.submit-btn');

    // Validações
    if (password !== passwordConfirm) {
        showMessage('As senhas não coincidem', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }

    setLoading(button, true);

    try {
        console.log('📝 Tentando criar conta com:', { name, email });
        
        // 1. Criar conta no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        console.log('📋 Resultado signUp:', { authData, authError });

        if (authError) throw authError;

        console.log('✅ Conta criada no Auth, criando registro na tabela usuarios...');

        // 2. Criar usuário na tabela usuarios
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .insert([
                {
                    nome: name,
                    email: email,
                    papel: 'professor'
                }
            ])
            .select();

        console.log('📋 Resultado insert usuarios:', { userData, userError });

        if (userError && !userError.message.includes('duplicate')) {
            throw userError;
        }

        console.log('✅ Registro completo!');
        showMessage('Conta criada com sucesso! Você pode fazer login agora.', 'success');
        
        // Limpar formulário
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-password-confirm').value = '';

        // Mudar para aba de login após 2 segundos
        setTimeout(() => {
            switchTab('login');
            document.getElementById('login-email').value = email;
        }, 2000);

    } catch (error) {
        console.error('❌ Erro no registro:', error);
        console.error('❌ Detalhes do erro:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            status: error.status
        });
        
        let errorMessage = 'Erro ao criar conta. Tente novamente.';
        
        if (error.message.includes('User already registered')) {
            errorMessage = 'Este email já está cadastrado';
        } else if (error.message.includes('duplicate key')) {
            errorMessage = 'Este email já está cadastrado';
        } else if (error.message) {
            errorMessage = `Erro: ${error.message}`;
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        setLoading(button, false, 'Criar Conta');
    }
}

// ========================================
// UTILITÁRIOS
// ========================================

console.log('🔐 Sistema de autenticação carregado');
console.log('🔗 Supabase URL:', SUPABASE_URL);
