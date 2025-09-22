// ARQUIVO: app.js (COM BUSCA INTELIGENTE)

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INICIALIZAÇÃO DO FIREBASE ---
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // --- 2. SELEÇÃO DE ELEMENTOS DO DOM ---
    const categoryContainer = document.getElementById('category-container');
    const productGrid = document.getElementById('product-grid');
    const sectionTitle = document.getElementById('section-title');
    const loadingMessage = document.getElementById('loading-message');
    const searchInput = document.getElementById('search-input');
    const logoImages = document.querySelectorAll('.logo-image');
    
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const finalizeOrderBtn = document.getElementById('finalize-order-btn');

    // --- 3. ESTADO DA APLICAÇÃO ---
    let allProducts = [];
    let storeSettings = {};
    let cart = JSON.parse(localStorage.getItem('myShopCart')) || [];

    // --- 4. FUNÇÕES DE CARREGAMENTO E RENDERIZAÇÃO ---

    async function loadInitialData() {
        try {
            const [productsSnapshot, settingsDoc] = await Promise.all([
                db.collection('products').orderBy('name').get(),
                db.collection('settings').doc('store').get()
            ]);

            allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (settingsDoc.exists) {
                storeSettings = settingsDoc.data();
                if (storeSettings.logoUrl) {
                    logoImages.forEach(img => img.src = storeSettings.logoUrl);
                }
            }

            if (loadingMessage) loadingMessage.style.display = 'none';

            renderCategories();
            renderProducts(allProducts);
            updateCartDisplay();

        } catch (error) {
            console.error("Erro ao carregar dados iniciais:", error);
            productGrid.innerHTML = '<p style="color: red;">Não foi possível carregar os produtos. Verifique a conexão e a configuração do Firebase.</p>';
        }
    }

    function renderCategories() {
        const categories = ['Todos', ...new Set(allProducts.map(p => p.category))].sort();
        categoryContainer.innerHTML = '';

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.textContent = category;
            if (category === 'Todos') button.classList.add('active');
            button.addEventListener('click', () => handleCategoryClick(category, button));
            categoryContainer.appendChild(button);
        });
    }

    function renderProducts(productsToShow) {
        productGrid.innerHTML = '';
        if (productsToShow.length === 0) {
            productGrid.innerHTML = '<p>Nenhum produto encontrado.</p>';
            return;
        }
        productsToShow.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x300/EFEFEF/AAAAAA?text=Imagem Indisponível'">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price-wrapper">
                        <span class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button class="add-to-cart-button" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Adicionar
                    </button>
                </div>
            `;
            card.querySelector('.add-to-cart-button').addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                addToCart(productId);
            });
            productGrid.appendChild(card);
        });
    }

    // --- 5. LÓGICA DE FILTRO E BUSCA (ATUALIZADA) ---

    function handleCategoryClick(category, clickedButton) {
        document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
        searchInput.value = ''; // Limpa a busca ao clicar na categoria

        const productsToRender = category === 'Todos' ? allProducts : allProducts.filter(p => p.category === category);
        renderProducts(productsToRender);
        sectionTitle.textContent = category;
    }

    // Evento 'input' dispara a cada letra digitada
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();

        // Se a busca estiver vazia, volta para a categoria "Todos"
        if (searchTerm === '') {
            handleCategoryClick('Todos', document.querySelector('.category-button'));
            return;
        }

        const filteredProducts = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.category.toLowerCase().includes(searchTerm)
        );
        
        renderProducts(filteredProducts);
        sectionTitle.textContent = `Resultados para "${searchInput.value}"`;
        
        // Desmarca qualquer botão de categoria ativo, pois a busca tem prioridade
        document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
    });

    // --- 6. LÓGICA DO CARRINHO ---
    // (Nenhuma alteração nesta seção)

    function addToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartDisplay();
    }

    function changeQuantity(productId, change) {
        const cartItem = cart.find(item => item.id === productId);
        if (!cartItem) return;
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        updateCartDisplay();
    }

    function updateCartDisplay() {
        localStorage.setItem('myShopCart', JSON.stringify(cart));
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartCount.textContent = totalItems;
        cartTotalPrice.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio.</p>';
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
        }
    }

    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('quantity-btn')) {
            const productId = target.dataset.id;
            const change = target.classList.contains('increase-btn') ? 1 : -1;
            changeQuantity(productId, change);
        }
    });

    function finalizeOrder() {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }
        if (!storeSettings.whatsappNumber) {
            alert('O número de WhatsApp da loja não está configurado. Não é possível finalizar o pedido.');
            return;
        }
        let message = "*Olá! Gostaria de fazer um pedido pela MyShop Online:*\n\n";
        cart.forEach(item => {
            message += `*${item.quantity}x* - ${item.name}\n`;
        });
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        message += `\n*Total:* R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${storeSettings.whatsappNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // --- 7. EVENT LISTENERS DO MODAL ---
    cartButton.addEventListener('click', () => cartModal.classList.remove('hidden'));
    closeCartBtn.addEventListener('click', () => cartModal.classList.add('hidden'));
    finalizeOrderBtn.addEventListener('click', finalizeOrder);

    // --- 8. INICIALIZAÇÃO ---
    loadInitialData();
});
