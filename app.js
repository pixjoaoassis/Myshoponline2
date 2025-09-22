// ARQUIVO: app.js (ATUALIZADO PARA LER DO FIREBASE)

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
    
    // --- 3. ESTADO DA APLICAÇÃO ---
    let allProducts = []; // Array para guardar todos os produtos carregados do BD

    // --- 4. FUNÇÕES DE CARREGAMENTO E RENDERIZAÇÃO ---

    /**
     * Carrega todos os produtos da coleção 'products' no Firestore.
     */
    async function loadProductsFromFirebase() {
        try {
            const snapshot = await db.collection('products').orderBy('name').get();
            
            // Transforma os documentos do Firebase em um array de objetos
            allProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Esconde a mensagem "Carregando..."
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }

            renderCategories(); // Cria os botões de categoria
            renderProducts(allProducts); // Exibe todos os produtos inicialmente

        } catch (error) {
            console.error("Erro ao carregar produtos do Firebase:", error);
            productGrid.innerHTML = '<p style="color: red;">Não foi possível carregar os produtos. Verifique a conexão e a configuração do Firebase.</p>';
        }
    }

    /**
     * Cria e exibe os botões de categoria dinamicamente.
     */
    function renderCategories() {
        if (!categoryContainer) return;

        // Extrai categorias únicas do array de produtos e as ordena
        const categories = [...new Set(allProducts.map(p => p.category))].sort();
        
        categoryContainer.innerHTML = ''; // Limpa as categorias estáticas

        // Cria o botão "Todos"
        const allButton = document.createElement('button');
        allButton.className = 'category-button active';
        allButton.textContent = 'Todos';
        allButton.addEventListener('click', () => handleCategoryClick('Todos', allButton));
        categoryContainer.appendChild(allButton);

        // Cria um botão para cada categoria
        categories.forEach(category => {
            const categoryButton = document.createElement('button');
            categoryButton.className = 'category-button';
            categoryButton.textContent = category;
            categoryButton.addEventListener('click', () => handleCategoryClick(category, categoryButton));
            categoryContainer.appendChild(categoryButton);
        });
    }

    /**
     * Exibe os produtos na tela.
     * @param {Array} productsToShow - O array de produtos a ser exibido.
     */
    function renderProducts(productsToShow) {
        if (!productGrid) return;

        productGrid.innerHTML = ''; // Limpa a grade de produtos

        if (productsToShow.length === 0) {
            productGrid.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
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
            productGrid.appendChild(card);
        });
    }

    // --- 5. LÓGICA DE INTERAÇÃO ---

    /**
     * Lida com o clique em um botão de categoria, filtrando os produtos.
     * @param {string} category - A categoria selecionada.
     * @param {HTMLElement} clickedButton - O botão que foi clicado.
     */
    function handleCategoryClick(category, clickedButton) {
        // Atualiza a classe 'active' nos botões
        const allButtons = categoryContainer.querySelectorAll('.category-button');
        allButtons.forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');

        // Filtra e exibe os produtos
        if (category === 'Todos') {
            renderProducts(allProducts);
            sectionTitle.textContent = 'Destaques';
        } else {
            const filteredProducts = allProducts.filter(p => p.category === category);
            renderProducts(filteredProducts);
            sectionTitle.textContent = category; // Muda o título da seção
        }
    }

    // --- 6. INICIALIZAÇÃO ---
    loadProductsFromFirebase();

});
