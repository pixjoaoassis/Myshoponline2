// ARQUIVO: admin.js (VERSÃO COMPLETA)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INICIALIZAÇÃO DO FIREBASE ---
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- 2. SELEÇÃO DE ELEMENTOS DO DOM ---
    // Seções principais
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    
    // Gerenciamento de Produtos
    const productListContainer = document.getElementById('product-list-container');
    const addProductBtn = document.getElementById('add-product-btn');

    // Gerenciamento de Configurações
    const settingsForm = document.getElementById('settings-form');
    const whatsappNumberInput = document.getElementById('whatsapp-number');

    // Modal de Produto (ainda não implementado, mas os botões já existem no HTML)
    // Vamos adicionar a lógica para ele no próximo conjunto.

    // --- 3. LÓGICA DE AUTENTICAÇÃO ---
    auth.onAuthStateChanged(user => {
        if (user) {
            loginSection.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            // Agora vamos chamar as funções para carregar os dados!
            loadProducts();
            loadSettings();
        } else {
            loginSection.classList.remove('hidden');
            adminPanel.classList.add('hidden');
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                console.error("Erro de login:", error.code, error.message);
                alert("Falha no login. Verifique seu e-mail e senha.");
            });
    });

    logoutButton.addEventListener('click', () => {
        auth.signOut();
    });

    // --- 4. CARREGAMENTO DE DADOS (READ) ---

    /**
     * Carrega os produtos do Firestore e os exibe na tela.
     */
    async function loadProducts() {
        productListContainer.innerHTML = '<p>Carregando produtos...</p>';
        
        try {
            // Esta é a consulta que pode exigir um índice!
            const snapshot = await db.collection('products').orderBy('category').orderBy('name').get();
            
            if (snapshot.empty) {
                productListContainer.innerHTML = '<p>Nenhum produto cadastrado ainda. Clique em "Novo Produto" para começar.</p>';
                return;
            }

            productListContainer.innerHTML = ''; // Limpa a área antes de adicionar os novos itens
            snapshot.docs.forEach(doc => {
                const product = { id: doc.id, ...doc.data() };
                const productElement = document.createElement('div');
                // Adicionamos um estilo que já existe no style.css do index.html
                productElement.className = 'product-list-item'; 
                productElement.innerHTML = `
                    <div class="product-list-info">
                        <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 1rem;">
                        <span>
                            <strong>${product.name}</strong>
                            <br>
                            <small>${product.category} - R$ ${product.price.toFixed(2).replace('.', ',')}</small>
                        </span>
                    </div>
                    <button class="btn-edit" data-id="${product.id}">Editar</button>
                `;
                // Adicionamos um estilo inline para o layout do item da lista
                productElement.querySelector('.product-list-info').style.display = 'flex';
                productElement.querySelector('.product-list-info').style.alignItems = 'center';

                productListContainer.appendChild(productElement);
            });

        } catch (error) {
            console.error("Erro ao carregar produtos: ", error);
            // Verifica se o erro é de índice faltando
            if (error.code === 'failed-precondition') {
                productListContainer.innerHTML = `<p style="color: red;"><strong>Erro:</strong> O banco de dados precisa de um índice para esta consulta. Abra o console (F12), clique no link no erro para criar o índice no Firebase e recarregue a página em alguns minutos.</p>`;
            } else {
                productListContainer.innerHTML = `<p style="color: red;">Ocorreu um erro ao carregar os produtos.</p>`;
            }
        }
    }

    /**
     * Carrega as configurações da loja do Firestore.
     */
    async function loadSettings() {
        const doc = await db.collection('settings').doc('store').get();
        if (doc.exists) {
            const data = doc.data();
            whatsappNumberInput.value = data.whatsappNumber || '';
        }
    }

    // --- 5. GERENCIAMENTO DE CONFIGURAÇÕES (UPDATE) ---
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const settingsData = {
            whatsappNumber: whatsappNumberInput.value,
        };

        try {
            // Usamos .set com { merge: true } para criar ou atualizar o documento
            await db.collection('settings').doc('store').set(settingsData, { merge: true });
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações: ', error);
            alert('Não foi possível salvar as configurações.');
        }
    });

    // --- 6. GERENCIAMENTO DE PRODUTOS (CREATE, UPDATE, DELETE) ---
    // A lógica completa para o modal de produtos será adicionada no próximo conjunto.
    // Por enquanto, vamos apenas simular a abertura.
    addProductBtn.addEventListener('click', () => {
        alert("A funcionalidade de adicionar/editar produtos será implementada no próximo passo!");
    });

    productListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const productId = e.target.dataset.id;
            alert(`Você clicou em editar o produto com ID: ${productId}. A implementação virá a seguir.`);
        }
    });

});
