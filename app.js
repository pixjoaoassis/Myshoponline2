// ARQUIVO: app.js

document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DE ELEMENTOS ---
    const categoryContainer = document.getElementById('category-container');

    // --- FUNÇÕES ---

    /**
     * Adiciona a lógica de clique aos botões de categoria.
     * Remove a classe 'active' de todos e a adiciona apenas ao clicado.
     */
    function setupCategoryButtons() {
        // Verifica se o container de categorias existe na página
        if (!categoryContainer) return;

        categoryContainer.addEventListener('click', (event) => {
            // Garante que o clique foi em um botão de categoria
            if (event.target.classList.contains('category-button')) {
                
                // Remove a classe 'active' de todos os botões
                const allButtons = categoryContainer.querySelectorAll('.category-button');
                allButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adiciona a classe 'active' ao botão que foi clicado
                event.target.classList.add('active');
                
                // No futuro, aqui chamaremos a função para filtrar os produtos
                console.log(`Categoria selecionada: ${event.target.textContent}`);
            }
        });
    }


    // --- INICIALIZAÇÃO ---
    
    // Chama a função para configurar os botões de categoria assim que a página carregar
    setupCategoryButtons();

});
