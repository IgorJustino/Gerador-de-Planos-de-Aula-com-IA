
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});


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


function setupEventListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('register-form-element').addEventListener('submit', handleRegister);
}


function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.form-content').forEach(f => f.classList.remove('active'));
    document.getElementById(`${tabName}-form`).classList.add('active');

    hideMessage();
}


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


function setLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span>Processando...';
    } else {
        button.disabled = false;
        button.textContent = originalText;
    }
}


async function handleLogin(event) {
    event.preventDefault();
    hideMessage();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const button = event.target.querySelector('.submit-btn');

    setLoading(button, true);

    try {
        console.log('🔐 Tentando fazer login com:', email);
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        console.log('📋 Resultado signInWithPassword:', { authData, authError });

        if (authError) throw authError;

        console.log('✅ Autenticação bem-sucedida!');
        console.log('📋 Token:', authData.session.access_token.substring(0, 20) + '...');
        console.log('📋 User ID (auth):', authData.user.id);

        const supabaseAuth = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${authData.session.access_token}`
                }
            }
        });

        console.log('🔍 Buscando dados do usuário na tabela usuarios...');

        let { data: userData, error: userError } = await supabaseAuth
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        console.log('📋 Resultado busca usuarios:', { userData, userError });

        if (userError) {
            console.warn('⚠️ Usuário não encontrado na tabela usuarios, criando...');
            
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


async function handleRegister(event) {
    event.preventDefault();
    hideMessage();

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const button = event.target.querySelector('.submit-btn');

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
        
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-password-confirm').value = '';

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


console.log('🔐 Sistema de autenticação carregado');
console.log('🔗 Supabase URL:', SUPABASE_URL);
