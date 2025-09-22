// ARQUIVO: admin.js (ATUALIZADO PARA GERENCIAR O LOGO)

document.addEventListener('DOMContentLoaded', () => {
    
    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- SELEÇÃO DE ELEMENTOS ---
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const productListContainer = document.getElementById('product-list-container');
    const settingsForm = document.getElementById('settings-form');
    const whatsappNumberInput = document.getElementById('whatsapp-number');
    const logoUrlInput = document.getElementById('store-logo-url'); // Novo campo do logo
    const logoImages = document.querySelectorAll('.logo-image');

    // Elementos do Modal
    const productModal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const deleteProductBtn = document.getElementById('delete-product-btn');

    // --- AUTENTICAÇÃO ---
    auth.onAuthStateChanged(user => {
        if (user) {
            loginSection.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            loadProducts();
            loadSettings();
        } else {
            loginSection.classList.remove('hidden');
            adminPanel.classList.add('hidden');
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        auth.signInWithEmailAndPassword(loginForm['admin-email'].value, loginForm['admin-password'].value)
            .catch(error => alert("Falha no login: " + error.message));
    });

    logoutButton.addEventListener('click', () => auth.signOut());

    // --- CARREGAMENTO DE DADOS (READ) ---
    async function loadProducts() {
        productListContainer.innerHTML = '<p>Carregando produtos...</p>';
        try {
            const snapshot = await db.collection('products').orderBy('category').orderBy('name').get();
            if (snapshot.empty) {
                productListContainer.innerHTML = '<p>Nenhum produto cadastrado. Clique em "Novo Produto".</p>';
                return;
            }
            productListContainer.innerHTML = '';
            snapshot.docs.forEach(doc => {
                const product = { id: doc.id, ...doc.data() };
                const item = document.createElement('div');
                item.className = 'product-list-item';
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <strong>${product.name}</strong><br>
                            <small>${product.category} - R$ ${product.price.toFixed(2).replace('.', ',')}</small>
                        </div>
                    </div>
                    <button class="btn-edit" data-id="${product.id}">Editar</button>
                `;
                productListContainer.appendChild(item);
            });
        } catch (error) {
            console.error("Erro ao carregar produtos: ", error);
            if (error.code === 'failed-precondition') {
                productListContainer.innerHTML = `<p style="color: red;"><strong>Erro de Índice.</strong> Crie o índice no Firebase como instruído anteriormente.</p>`;
            } else {
                productListContainer.innerHTML = `<p style="color: red;">Ocorreu um erro ao carregar os produtos.</p>`;
            }
        }
    }

    async function loadSettings() {
        const doc = await db.collection('settings').doc('store').get();
        if (doc.exists) {
            const settings = doc.data();
            whatsappNumberInput.value = settings.whatsappNumber || '';
            logoUrlInput.value = settings.logoUrl || '';
            // Atualiza o logo no painel admin também
            if (settings.logoUrl) {
                logoImages.forEach(img => img.src = settings.logoUrl);
            }
        }
    }

    // --- LÓGICA DO MODAL (CREATE, UPDATE, DELETE) ---
    const openModal = (product = null) => {
        productForm.reset();
        if (product) {
            modalTitle.textContent = 'Editar Produto';
            productForm['product-id'].value = product.id;
            productForm['product-name'].value = product.name;
            productForm['product-category'].value = product.category;
            productForm['product-price'].value = product.price;
            productForm['product-image'].value = product.image;
            deleteProductBtn.classList.remove('hidden');
        } else {
            modalTitle.textContent = 'Novo Produto';
            deleteProductBtn.classList.add('hidden');
        }
        productModal.classList.remove('hidden');
    };

    const closeModal = () => productModal.classList.add('hidden');

    addProductBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = productForm['product-id'].value;
        const productData = {
            name: productForm['product-name'].value,
            category: productForm['product-category'].value,
            price: parseFloat(productForm['product-price'].value),
            image: productForm['product-image'].value,
        };

        try {
            if (id) {
                await db.collection('products').doc(id).update(productData);
            } else {
                await db.collection('products').add(productData);
            }
            closeModal();
            loadProducts();
        } catch (error) {
            alert("Erro ao salvar produto: " + error.message);
        }
    });

    deleteProductBtn.addEventListener('click', async () => {
        const id = productForm['product-id'].value;
        if (id && confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
            try {
                await db.collection('products').doc(id).delete();
                closeModal();
                loadProducts();
            } catch (error) {
                alert("Erro ao excluir produto: " + error.message);
            }
        }
    });

    productListContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const id = e.target.dataset.id;
            const doc = await db.collection('products').doc(id).get();
            if (doc.exists) {
                openModal({ id: doc.id, ...doc.data() });
            }
        }
    });

    // --- SALVAR CONFIGURAÇÕES ---
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const settingsData = {
            whatsappNumber: whatsappNumberInput.value,
            logoUrl: logoUrlInput.value // Salva a URL do logo
        };
        try {
            await db.collection('settings').doc('store').set(settingsData, { merge: true });
            alert('Configurações salvas!');
            // Atualiza o logo na tela imediatamente
            if (settingsData.logoUrl) {
                logoImages.forEach(img => img.src = settingsData.logoUrl);
            }
        } catch (error) {
            alert('Erro ao salvar configurações: ' + error.message);
        }
    });
});
