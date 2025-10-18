// ========================================
// CONFIGURAÇÕES
// ========================================

const API_URL = 'http://localhost:3000/api/planos/gerar';

// ========================================
// ELEMENTOS DO DOM
// ========================================

const form = document.getElementById('formPlanoAula');
const resultado = document.getElementById('resultado');
const submitButton = form.querySelector('button[type="submit"]');

// ========================================
// EVENT LISTENERS
// ========================================

form.addEventListener('submit', handleSubmit);

// ========================================
// FUNÇÃO PRINCIPAL: SUBMIT DO FORMULÁRIO
// ========================================

async function handleSubmit(e) {
    e.preventDefault();

    const dados = coletarDadosFormulario();
    
    mostrarLoading();
    desabilitarBotao();
    scrollParaResultado();

    try {
        const plano = await gerarPlanoDeAula(dados);
        mostrarPlano(plano);
    } catch (error) {
        mostrarErro(error);
    } finally {
        habilitarBotao();
    }
}

// ========================================
// FUNÇÕES DE COLETA DE DADOS
// ========================================

function coletarDadosFormulario() {
    return {
        tema: document.getElementById('tema').value.trim(),
        nivelEnsino: document.getElementById('nivelEnsino').value,
        duracaoMinutos: parseInt(document.getElementById('duracao').value),
        codigoBNCC: document.getElementById('codigoBNCC').value.trim() || undefined,
        observacoes: document.getElementById('observacoes').value.trim() || undefined
    };
}

// ========================================
// FUNÇÕES DE API
// ========================================

async function gerarPlanoDeAula(dados) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.erro || `Erro na API: ${response.status} - ${response.statusText}`
            );
        }

        const result = await response.json();
        
        if (!result.sucesso) {
            throw new Error(result.erro || 'Erro ao gerar plano de aula');
        }

        // A API retorna as seções diretas, não dentro de result.plano
        return {
            introducaoLudica: result.introducaoLudica,
            objetivoAprendizagem: result.objetivoAprendizagem,
            passoAPasso: result.passoAPasso,
            rubricaAvaliacao: result.rubricaAvaliacao
        };
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(
                'Não foi possível conectar à API. Verifique se o servidor está rodando em http://localhost:3000'
            );
        }
        throw error;
    }
}

// ========================================
// FUNÇÕES DE UI - LOADING
// ========================================

function mostrarLoading() {
    resultado.style.display = 'block';
    resultado.innerHTML = `
        <div class="card">
            <div class="loading">
                <div class="loading-spinner"></div>
                <p class="loading-text">Gerando seu plano de aula...</p>
                <p class="loading-text" style="font-size: 0.9rem; opacity: 0.7; margin-top: 10px;">
                    Isso pode levar alguns segundos
                </p>
            </div>
        </div>
    `;
}

// ========================================
// FUNÇÕES DE UI - PLANO GERADO
// ========================================

function mostrarPlano(plano) {
    resultado.innerHTML = `
        <div class="card">
            <div class="secao">
                <div class="secao-header acordeao-header" onclick="toggleSecao(this)">
                    <span class="secao-icon">📘</span>
                    <h2>Introdução Lúdica</h2>
                    <span class="acordeao-seta">▼</span>
                </div>
                <div class="secao-content acordeao-content aberto">${escaparHTML(plano.introducaoLudica)}</div>
            </div>
            
            <div class="secao">
                <div class="secao-header acordeao-header" onclick="toggleSecao(this)">
                    <span class="secao-icon">🎯</span>
                    <h2>Objetivo de Aprendizagem</h2>
                    <span class="acordeao-seta">▼</span>
                </div>
                <div class="secao-content acordeao-content aberto">${escaparHTML(plano.objetivoAprendizagem)}</div>
            </div>
            
            <div class="secao">
                <div class="secao-header acordeao-header" onclick="toggleSecao(this)">
                    <span class="secao-icon">🧩</span>
                    <h2>Passo a Passo da Atividade</h2>
                    <span class="acordeao-seta">▼</span>
                </div>
                <div class="secao-content acordeao-content aberto">${escaparHTML(plano.passoAPasso)}</div>
            </div>
            
            <div class="secao">
                <div class="secao-header acordeao-header" onclick="toggleSecao(this)">
                    <span class="secao-icon">✅</span>
                    <h2>Rubrica de Avaliação</h2>
                    <span class="acordeao-seta">▼</span>
                </div>
                <div class="secao-content acordeao-content aberto">${escaparHTML(plano.rubricaAvaliacao)}</div>
            </div>

            <button type="button" class="btn btn-secondary" onclick="gerarNovoPlano()">
                🔄 Gerar Novo Plano
            </button>
        </div>
    `;
}

// ========================================
// FUNÇÃO DE ACORDEÃO
// ========================================

function toggleSecao(header) {
    const content = header.nextElementSibling;
    const seta = header.querySelector('.acordeao-seta');
    
    if (content.classList.contains('aberto')) {
        content.classList.remove('aberto');
        seta.textContent = '▶';
    } else {
        content.classList.add('aberto');
        seta.textContent = '▼';
    }
}

// ========================================
// FUNÇÕES DE UI - ERRO
// ========================================

function mostrarErro(error) {
    resultado.innerHTML = `
        <div class="card">
            <div class="error">
                <strong>❌ Erro ao gerar plano de aula</strong>
                <p>${escaparHTML(error.message)}</p>
            </div>
            <button type="button" class="btn btn-secondary" onclick="gerarNovoPlano()">
                🔄 Tentar Novamente
            </button>
        </div>
    `;
    
    console.error('Erro ao gerar plano:', error);
}

// ========================================
// FUNÇÕES DE CONTROLE DE BOTÃO
// ========================================

function desabilitarBotao() {
    submitButton.disabled = true;
    submitButton.textContent = 'Gerando...';
}

function habilitarBotao() {
    submitButton.disabled = false;
    submitButton.textContent = 'Gerar Plano de Aula';
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function scrollParaResultado() {
    setTimeout(() => {
        resultado.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 100);
}

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function gerarNovoPlano() {
    resultado.style.display = 'none';
    resultado.innerHTML = '';
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
}

// ========================================
// VALIDAÇÕES ADICIONAIS
// ========================================

// Validação em tempo real da duração
document.getElementById('duracao').addEventListener('input', (e) => {
    const valor = parseInt(e.target.value);
    if (valor < 10) {
        e.target.setCustomValidity('A duração mínima é de 10 minutos');
    } else if (valor > 300) {
        e.target.setCustomValidity('A duração máxima é de 300 minutos (5 horas)');
    } else {
        e.target.setCustomValidity('');
    }
});

// Formatação automática do código BNCC
document.getElementById('codigoBNCC').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

// ========================================
// INICIALIZAÇÃO
// ========================================

console.log('📚 Gerador de Planos de Aula - Carregado com sucesso!');
console.log('🔗 API URL:', API_URL);
