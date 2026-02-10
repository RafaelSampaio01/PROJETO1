// main.js

function initializeMIHUStudio() {
    console.log("Inicializando MIHU STUDIO...");
    
    // 1. Inicializar Blockly
    workspace = initializeBlockly();
    
    // 2. Configurar listener para atualizar código
    if (workspace) {
        workspace.addChangeListener(() => {
            saveActiveProgram();
            updateCodePreview();
        });
    }
    
    // 3. Inicializar Program Manager
    initializeProgramManager();
    
    // 4. Inicializar Terminal
    initializeTerminal();
    
    // 5. Inicializar UI Handlers
    initializeUIHandlers();
    
    // 6. Criar exemplo inicial
    createInitialExample();
    
    console.log("MIHU STUDIO inicializado com sucesso!");
}

function createInitialExample() {
    if (!workspace) return;
    
    // Verificar se já tem blocos
    const blocks = workspace.getAllBlocks();
    if (blocks.length > 1) return; // Já tem conteúdo
    
    // Criar bloco de print
    const printBlock = workspace.newBlock('text_print');
    printBlock.initSvg();
    printBlock.render();
    printBlock.moveBy(100, 100);
    
    // Criar texto
    const textBlock = workspace.newBlock('text');
    textBlock.setFieldValue('Olá MIHU Studio!', 'TEXT');
    textBlock.initSvg();
    textBlock.render();
    textBlock.moveBy(50, 50);
    
    // Conectar ao bloco de inicialização
    const initBlock = workspace.getTopBlocks().find(b => b.type === 'mihu_init');
    if (initBlock) {
        initBlock.getInput('DO').connection.connect(printBlock.previousConnection);
        printBlock.getInput('TEXT').connection.connect(textBlock.outputConnection);
    }
    
    // Atualizar código
    updateCodePreview();
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeMIHUStudio();
    }, 100);
});

// Redimensionar quando a janela mudar de tamanho
window.addEventListener('resize', () => {
    if (workspace) {
        Blockly.svgResize(workspace);
    }
});