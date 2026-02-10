// modules/ui-handlers.js

function setupResizer() {
    const resizer = document.getElementById('resizer');
    const blocklyDiv = document.getElementById('blocklyDiv');
    const codePanel = document.querySelector('.code-panel');
    
    if (!resizer || !blocklyDiv || !codePanel) return;
    
    let isResizing = false;
    let startX = 0;
    let startBlocklyWidth = 0;
    
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startBlocklyWidth = blocklyDiv.offsetWidth;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const container = blocklyDiv.parentElement;
        const containerWidth = container.offsetWidth;
        
        const newBlocklyWidth = Math.max(200, Math.min(containerWidth - 200, startBlocklyWidth + deltaX));
        const blocklyPercent = (newBlocklyWidth / containerWidth) * 100;
        const codePercent = 100 - blocklyPercent;
        
        blocklyDiv.style.flex = `0 0 ${blocklyPercent}%`;
        codePanel.style.width = `${codePercent}%`;
        
        // Redimensionar Blockly
        if (workspace) {
            Blockly.svgResize(workspace);
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
        }
    });
}

function setupModeToggle() {
    const toggleMode = document.getElementById('toggleMode');
    const blocklyDiv = document.getElementById('blocklyDiv');
    const codePanel = document.querySelector('.code-panel');
    
    if (!toggleMode || !blocklyDiv || !codePanel) return;
    
    toggleMode.addEventListener('click', () => {
        const isBlocklyVisible = blocklyDiv.style.display !== "none";
        
        if (isBlocklyVisible) {
            // Mudar para modo código
            blocklyDiv.style.display = "none";
            codePanel.style.width = "100%";
            toggleMode.textContent = "Modo Blocos";
        } else {
            // Mudar para modo blocos
            blocklyDiv.style.display = "block";
            codePanel.style.width = "35%";
            toggleMode.textContent = "Modo Código";
            
            // Redimensionar Blockly
            if (workspace) {
                setTimeout(() => {
                    Blockly.svgResize(workspace);
                }, 100);
            }
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter: Executar código
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('runBtn').click();
        }
        
        // Ctrl+S: Salvar e executar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            document.getElementById('runSaveBtn').click();
        }
        
        // Ctrl+N: Novo programa
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            document.getElementById('newProg').click();
        }
        
        // Esc: Parar execução
        if (e.key === 'Escape') {
            document.getElementById('stopBtn').click();
        }
    });
}

function setupEventHandlers() {
    // Botão Novo Programa
    document.getElementById('newProg').addEventListener('click', () => {
        createNewProgram();
    });
    
    // Botão Executar
    document.getElementById('runBtn').addEventListener('click', async () => {
        const code = generatePythonCode();
        await executePythonCode(code);
    });
    
    // Botão Executar e Salvar
    document.getElementById('runSaveBtn').addEventListener('click', async () => {
        const code = generatePythonCode();
        const program = getCurrentProgram();
        
        if (program) {
            const filename = getProgramFilename(currentProgramId);
            await executeAndSave(code, filename);
        }
    });
    
    // Botão Stop
    document.getElementById('stopBtn').addEventListener('click', async () => {
        await sendStopCommand();
    });
    
    // Botão Conectar/Desconectar
    document.getElementById('connectBtn').addEventListener('click', async () => {
        if (isSerialConnected) {
            await disconnectSerial();
        } else {
            await connectToSerial();
        }
    });
}

function initializeUIHandlers() {
    // Configurar funcionalidades
    setupResizer();
    setupModeToggle();
    setupKeyboardShortcuts();
    setupEventHandlers();
    
    console.log("UI Handlers inicializados");
}