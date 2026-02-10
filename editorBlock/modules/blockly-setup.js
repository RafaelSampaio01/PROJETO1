// modules/blockly-setup.js

// Configurações globais
let workspace = null;

// Criar tema escuro personalizado para Blockly
function createDarkTheme() {
    // Baseado no tema Dark, mas com nossas cores
    Blockly.Themes.Dark = Blockly.Theme.defineTheme('dark', {
        'base': Blockly.Themes.Classic,
        'componentStyles': {
            'workspaceBackgroundColour': '#1a252f', // Mesmo do header
            'toolboxBackgroundColour': '#2c3e50',    // Mesmo do bg-medium
            'toolboxForegroundColour': '#ecf0f1',    // Texto claro
            'flyoutBackgroundColour': '#34495e',     // Mesmo do bg-light
            'flyoutForegroundColour': '#bdc3c7',     // Texto muted
            'flyoutOpacity': 0.95,
            'scrollbarColour': '#3498db',           // Azul MIHU
            'scrollbarOpacity': 0.7,
            'insertionMarkerColour': '#3498db',
            'insertionMarkerOpacity': 0.3,
            'markerColour': '#e74c3c',              // Vermelho para seleção
            'cursorColour': '#3498db',              // Azul para cursor
            'selectedGlowColour': '#3498db',
            'selectedGlowOpacity': 0.3
        },
        'fontStyle': {
            'family': '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            'weight': 'normal',
            'size': 14
        },
        'startHats': true
    });
}

// Bloco personalizado MIHU INIT
function setupMihuBlock() {
    Blockly.Blocks['mihu_init'] = {
        init() {
            this.appendStatementInput("DO").appendField("Inicializar");
            this.setColour("#3498db");  // Azul MIHU
            this.setMovable(false);
            this.setDeletable(false);
            this.setTooltip("Bloco de inicialização da controladora MIHU");
        }
    };

    Blockly.Python['mihu_init'] = function(block) {
        return Blockly.Python.statementToCode(block, "DO");
    };
}

// Definir cores para categorias
function setupBlockColors() {
    // Cores personalizadas para blocos
    Blockly.Msg.LOGIC_HUE = "#e74c3c";      // Vermelho para lógica
    Blockly.Msg.LOOPS_HUE = "#f39c12";      // Laranja para loops
    Blockly.Msg.MATH_HUE = "#9b59b6";       // Roxo para matemática
    Blockly.Msg.TEXTS_HUE = "#2ecc71";      // Verde para texto
    Blockly.Msg.LISTS_HUE = "#e67e22";      // Laranja escuro para listas
    Blockly.Msg.COLOUR_HUE = "#3498db";     // Azul para cores
    Blockly.Msg.VARIABLES_HUE = "#d35400";  // Marrom para variáveis
    Blockly.Msg.PROCEDURES_HUE = "#8e44ad"; // Roxo escuro para procedimentos
}

// Inicializar workspace com tema escuro
function initializeBlockly() {
    createDarkTheme();
    setupMihuBlock();
    setupBlockColors();
    
    workspace = Blockly.inject('blocklyDiv', {
        theme: Blockly.Themes.Dark,
        grid: {
            spacing: 20,
            length: 3,
            colour: '#34495e',     // Cinza azulado
            snap: true
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        trashcan: true,
        renderer: 'zelos',  // Renderizador mais moderno
        move: {
            scrollbars: {
                horizontal: true,
                vertical: true
            },
            drag: true,
            wheel: true
        },
        toolbox: `
            <xml>
                <category name="Programa" colour="#3498db">
                    <block type="mihu_init"></block>
                </category>
                <category name="Texto" colour="#2ecc71">
                    <block type="text"></block>
                    <block type="text_print"></block>
                    <block type="text_join"></block>
                    <block type="text_length"></block>
                </category>
                <category name="Lógica" colour="#e74c3c">
                    <block type="controls_if"></block>
                    <block type="logic_compare"></block>
                    <block type="logic_operation"></block>
                    <block type="logic_boolean"></block>
                </category>
                <category name="Laços" colour="#f39c12">
                    <block type="controls_repeat_ext"></block>
                    <block type="controls_whileUntil"></block>
                    <block type="controls_for"></block>
                </category>
                <category name="Matemática" colour="#9b59b6">
                    <block type="math_number"></block>
                    <block type="math_arithmetic"></block>
                    <block type="math_random_int"></block>
                    <block type="math_round"></block>
                </category>
                <category name="Variáveis" colour="#d35400" custom="VARIABLE"></category>
                <category name="Funções" colour="#8e44ad" custom="PROCEDURE"></category>
            </xml>
        `
    });
    
    // Aplicar estilos CSS adicionais para o workspace
    applyDarkWorkspaceStyles();
    
    return workspace;
}

// Aplicar estilos CSS adicionais
function applyDarkWorkspaceStyles() {
    // Aguardar o DOM do Blockly ser criado
    setTimeout(() => {
        // Encontrar elementos do Blockly
        const injectionDiv = document.querySelector('.injectionDiv');
        const blocklyCanvas = document.querySelector('.blocklyCanvas');
        const blocklyToolboxDiv = document.querySelector('.blocklyToolboxDiv');
        const blocklyFlyout = document.querySelector('.blocklyFlyout');
        
        // Aplicar estilos adicionais
        if (injectionDiv) {
            injectionDiv.style.backgroundColor = '#1a252f';
        }
        
        if (blocklyCanvas) {
            blocklyCanvas.style.backgroundColor = '#1a252f';
        }
        
        if (blocklyToolboxDiv) {
            blocklyToolboxDiv.style.backgroundColor = '#2c3e50';
            blocklyToolboxDiv.style.borderRight = '1px solid #34495e';
        }
        
        if (blocklyFlyout) {
            blocklyFlyout.style.backgroundColor = '#34495e';
            blocklyFlyout.style.borderRight = '1px solid #2c3e50';
        }
        
        // Estilizar blocos individualmente
        const blocklyPaths = document.querySelectorAll('.blocklyPath');
        blocklyPaths.forEach(path => {
            if (path.getAttribute('fill') === '#ffffff') {
                path.setAttribute('fill', '#2c3e50');
            }
        });
        
        // Estilizar textos dos blocos
        const blocklyTexts = document.querySelectorAll('.blocklyText');
        blocklyTexts.forEach(text => {
            text.style.fill = '#ecf0f1';
            text.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        });
    }, 100);
}

// Garantir bloco inicial
function ensureInitBlock() {
    if (workspace && !workspace.getTopBlocks(false).some(b => b.type === "mihu_init")) {
        const block = workspace.newBlock("mihu_init");
        block.initSvg();
        block.render();
        block.moveBy(40, 40);
    }
}

// Gerar código Python
function generatePythonCode() {
    if (!workspace) return "";
    
    const initBlock = workspace.getTopBlocks(true).find(b => b.type === "mihu_init");
    if (!initBlock) return "";
    
    let code = Blockly.Python.statementToCode(initBlock, "DO");
    const lines = code.split("\n").filter(x => x.trim());
    
    if (!lines.length) return "";
    
    const indent = lines[0].match(/^\s*/)[0].length;
    return lines.map(x => x.slice(indent)).join("\n") + "\n";
}

// Atualizar visualização do código
function updateCodePreview() {
    const codeEditor = document.getElementById('codeEditor');
    if (codeEditor) {
        codeEditor.value = generatePythonCode();
    }
}

// Redimensionar workspace
function resizeBlocklyWorkspace() {
    if (workspace) {
        Blockly.svgResize(workspace);
        // Reaplicar estilos após redimensionamento
        setTimeout(applyDarkWorkspaceStyles, 50);
    }
}