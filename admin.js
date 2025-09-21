// ARQUIVO: admin.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INICIALIZAÇÃO DO FIREBASE ---
    // Verifica se o Firebase já foi inicializado
    if (!firebase.apps.length) {
        // Inicializa o Firebase com as configurações do arquivo config.js
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth(); // Serviço de Autenticação
    const db = firebase.firestore(); // Banco de dados Firestore

    // --- 2. SELEÇÃO DE ELEMENTOS DO DOM ---
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');

    // --- 3. LÓGICA DE AUTENTICAÇÃO ---

    /**
     * Observador do estado de autenticação.
     * Esta função é chamada automaticamente pelo Firebase sempre que o estado de login/logout muda.
     */
    auth.onAuthStateChanged(user => {
        if (user) {
            // Se existe um usuário logado:
            console.log("Usuário logado:", user.email);
            loginSection.classList.add('hidden'); // Esconde a tela de login
            adminPanel.classList.remove('hidden'); // Mostra o painel de administração
            
            // No futuro, aqui chamaremos as funções para carregar produtos e configurações
            // loadProducts();
            // loadSettings();
        } else {
            // Se não há usuário logado:
            console.log("Nenhum usuário logado.");
            loginSection.classList.remove('hidden'); // Mostra a tela de login
            adminPanel.classList.add('hidden'); // Esconde o painel de administração
        }
    });

    /**
     * Evento de submissão do formulário de login.
     */
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        // Tenta fazer o login com o e-mail e senha fornecidos
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                // Se houver um erro, exibe um alerta
                console.error("Erro de login:", error.message);
                alert("Falha no login. Verifique seu e-mail e senha.");
            });
    });

    /**
     * Evento de clique no botão de logout.
     */
    logoutButton.addEventListener('click', () => {
        // Desconecta o usuário
        auth.signOut();
    });

});
