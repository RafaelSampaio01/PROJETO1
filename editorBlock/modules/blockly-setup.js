// modules/blockly-setup.js

// ==============================
// CONFIGURAÇÕES GLOBAIS
// ==============================

let workspace = null;

// Placa selecionada atualmente.
// No futuro, esse valor pode vir de um select, config inicial ou localStorage.
const CURRENT_BOARD = "MIHUS3";


// ==============================
// TEMA ESCURO DO BLOCKLY
// ==============================

function createDarkTheme() {
    Blockly.Themes.Dark = Blockly.Theme.defineTheme("dark", {
        base: Blockly.Themes.Classic,

        blockStyles: {
            logic_blocks: {
                colourPrimary: "#e74c3c",
                colourSecondary: "#c0392b",
                colourTertiary: "#922b21"
            },

            loop_blocks: {
                colourPrimary: "#f39c12",
                colourSecondary: "#e67e22",
                colourTertiary: "#d35400"
            },

            math_blocks: {
                colourPrimary: "#9b59b6",
                colourSecondary: "#8e44ad",
                colourTertiary: "#6c3483"
            },

            text_blocks: {
                colourPrimary: "#2ecc71",
                colourSecondary: "#27ae60",
                colourTertiary: "#1e8449"
            },

            variable_blocks: {
                colourPrimary: "#d35400",
                colourSecondary: "#ba4a00",
                colourTertiary: "#873600"
            },

            procedure_blocks: {
                colourPrimary: "#8e44ad",
                colourSecondary: "#7d3c98",
                colourTertiary: "#633974"
            }
        },

        categoryStyles: {
            logic_category: {
                colour: "#e74c3c"
            },

            loop_category: {
                colour: "#f39c12"
            },

            math_category: {
                colour: "#9b59b6"
            },

            text_category: {
                colour: "#2ecc71"
            },

            variable_category: {
                colour: "#d35400"
            },

            procedure_category: {
                colour: "#8e44ad"
            }
        },

        componentStyles: {
            workspaceBackgroundColour: "#1a252f",

            toolboxBackgroundColour: "#1f2933",
            toolboxForegroundColour: "#d7dee8",

            flyoutBackgroundColour: "#34495e",
            flyoutForegroundColour: "#bdc3c7",
            flyoutOpacity: 0.95,

            scrollbarColour: "#3498db",
            scrollbarOpacity: 0.7,

            insertionMarkerColour: "#3498db",
            insertionMarkerOpacity: 0.3,

            markerColour: "#ffd400",
            cursorColour: "#ffd400",

            selectedGlowColour: "#ffd400",
            selectedGlowOpacity: 0.8
        },

        fontStyle: {
            family: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            weight: "normal",
            size: 14
        },

        startHats: true
    });
}


// ==============================
// CORES DOS BLOCOS PADRÃO
// ==============================

function setupBlockColors() {
    Blockly.Msg.LOGIC_HUE = "#e74c3c";
    Blockly.Msg.LOOPS_HUE = "#f39c12";
    Blockly.Msg.MATH_HUE = "#9b59b6";
    Blockly.Msg.TEXTS_HUE = "#2ecc71";
    Blockly.Msg.LISTS_HUE = "#e67e22";
    Blockly.Msg.COLOUR_HUE = "#3498db";
    Blockly.Msg.VARIABLES_HUE = "#d35400";
    Blockly.Msg.PROCEDURES_HUE = "#8e44ad";
}


// ==============================
// CARREGAMENTO DO CONFIG DA PLACA
// ==============================

async function loadBoardConfig(boardName) {
    const configPath = `/src/board/${boardName}/config.json`;

    const response = await fetch(configPath);

    if (!response.ok) {
        throw new Error(`Erro ao carregar config da placa: ${configPath}`);
    }

    const config = await response.json();

    if (!config.id || !config.toolbox) {
        throw new Error(`config.json inválido para a placa: ${boardName}`);
    }

    return config;
}


// ==============================
// CARREGAMENTO DINÂMICO DE SCRIPT
// ==============================

function loadScriptOnce(src, dataAttributeName, dataAttributeValue) {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(
            `script[${dataAttributeName}="${dataAttributeValue}"]`
        );

        if (existingScript) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.setAttribute(dataAttributeName, dataAttributeValue);

        script.onload = () => {
            resolve();
        };

        script.onerror = () => {
            reject(new Error(`Erro ao carregar script: ${src}`));
        };

        document.head.appendChild(script);
    });
}


// ==============================
// CARREGAMENTO DO PROFILE DA PLACA
// ==============================

async function loadBoardProfile(boardName, boardConfig) {
    if (!boardConfig.profilePath) {
        console.warn(`A placa ${boardName} não possui profilePath definido no config.json.`);
        return null;
    }

    const profilePath = `/src/board/${boardName}/${boardConfig.profilePath}`;

    await loadScriptOnce(profilePath, "data-board-profile", boardName);

    if (!window.MIHU_BOARD_PROFILE) {
        throw new Error(`Profile carregado, mas window.MIHU_BOARD_PROFILE não foi definido: ${profilePath}`);
    }

    if (window.MIHU_BOARD_PROFILE.id !== boardName) {
        console.warn(
            `Profile carregado com id diferente. Esperado: ${boardName}, recebido: ${window.MIHU_BOARD_PROFILE.id}`
        );
    }

    console.log("Profile carregado:", window.MIHU_BOARD_PROFILE.name);

    return window.MIHU_BOARD_PROFILE;
}


// ==============================
// CARREGAMENTO DO TOOLBOX DA PLACA
// ==============================

async function loadToolboxXml(boardName, boardConfig) {
    const toolboxPath = `/src/board/${boardName}/${boardConfig.toolbox}`;

    const response = await fetch(toolboxPath, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`Erro ao carregar o toolbox da placa: ${toolboxPath}`);
    }

    const toolboxText = await response.text();

    const parser = new DOMParser();
    const toolboxXml = parser.parseFromString(toolboxText, "text/xml");

    const parserError = toolboxXml.querySelector("parsererror");

    if (parserError) {
        console.error(parserError.textContent);
        throw new Error(`Erro de sintaxe no XML do toolbox da placa: ${boardName}`);
    }

    if (typeof window.translateMihuToolbox === "function") {
        window.translateMihuToolbox(toolboxXml);
    }

    return toolboxXml.documentElement;
}


// ==============================
// INICIALIZAÇÃO DO BLOCKLY
// ==============================

async function initializeBlockly() {
    createDarkTheme();
    setupBlockColors();

    const boardConfig = await loadBoardConfig(CURRENT_BOARD);

    // Carrega o profile antes do toolbox e antes do Blockly.inject.
    // Assim os blocos personalizados já podem usar window.MIHU_BOARD_PROFILE.
    const boardProfile = await loadBoardProfile(CURRENT_BOARD, boardConfig);

    const toolboxXml = await loadToolboxXml(CURRENT_BOARD, boardConfig);

    console.log("Placa carregada:", boardConfig.name);

    workspace = Blockly.inject("blocklyDiv", {
        theme: Blockly.Themes.Dark,

        grid: {
            spacing: 20,
            length: 3,
            colour: "#34495e",
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

        renderer: "zelos",

        move: {
            scrollbars: {
                horizontal: true,
                vertical: true
            },
            drag: true,
            wheel: true
        },

        toolbox: toolboxXml
    });

    // Guarda referências globais úteis para outros módulos.
    window.MIHU_CURRENT_BOARD = CURRENT_BOARD;
    window.MIHU_BOARD_CONFIG = boardConfig;
    window.MIHU_BOARD_PROFILE = boardProfile;

    applyDarkWorkspaceStyles();
    applyReferenceToolboxStyles(toolboxXml);
    setupVariableToolbox(workspace);
    setupCustomBlocksToolbox(workspace);

    return workspace;
}


// ==============================
// ESTILOS ADICIONAIS DO WORKSPACE
// ==============================

function applyDarkWorkspaceStyles() {
    setTimeout(() => {
        const injectionDiv = document.querySelector(".injectionDiv");
        const blocklyCanvas = document.querySelector(".blocklyCanvas");
        const blocklyToolboxDiv = document.querySelector(".blocklyToolboxDiv");
        const blocklyFlyout = document.querySelector(".blocklyFlyout");

        if (injectionDiv) {
            injectionDiv.style.backgroundColor = "#1a252f";
        }

        if (blocklyCanvas) {
            blocklyCanvas.style.backgroundColor = "#1a252f";
        }

        if (blocklyToolboxDiv) {
            blocklyToolboxDiv.style.backgroundColor = "#1f2933";
            blocklyToolboxDiv.style.borderRight = "1px solid #2f3b4a";
        }

        if (blocklyFlyout) {
            blocklyFlyout.style.backgroundColor = "#34495e";
            blocklyFlyout.style.borderRight = "1px solid #2c3e50";
        }
    }, 100);
}

function applyReferenceToolboxStyles(toolboxXml) {
    const categoryColours = new Map();

    toolboxXml.querySelectorAll("category").forEach((category) => {
        const name = category.getAttribute("name");
        const colour = category.getAttribute("colour");

        if (name && colour) {
            categoryColours.set(name.trim(), colour.trim());
        }
    });

    const paintRows = () => {
        document
            .querySelectorAll(".blocklyTreeRow, .blocklyToolboxCategory")
            .forEach((row) => {
            const label = row.querySelector(".blocklyTreeLabel, .blocklyToolboxCategoryLabel");

            if (!label) {
                return;
            }

            const labelText = label.textContent.trim();
            const colour = categoryColours.get(labelText) || "#7f8c8d";

            row.style.setProperty("--mihu-toolbox-category-colour", colour);
            row.title = labelText;

            if (!row.querySelector(".mihuToolboxDot")) {
                const dot = document.createElement("span");
                dot.className = "mihuToolboxDot";
                dot.setAttribute("aria-hidden", "true");
                const content = row.querySelector(".blocklyToolboxCategoryContent");
                const dotParent = content || row;
                dotParent.insertBefore(dot, dotParent.firstChild);
            }
        });
    };

    setTimeout(() => {
        paintRows();

        const toolbox = document.querySelector(".blocklyToolboxDiv");

        if (toolbox) {
            const observer = new MutationObserver(paintRows);
            observer.observe(toolbox, {
                childList: true,
                subtree: true
            });
        }
    }, 100);
}

function setupVariableToolbox(blocklyWorkspace) {
    if (!blocklyWorkspace) {
        return;
    }

    const createVariableCompat = (targetWorkspace, name) => {
        if (!targetWorkspace || !name) {
            return null;
        }

        if (typeof targetWorkspace.createVariable === "function") {
            return targetWorkspace.createVariable(name);
        }

        if (
            typeof targetWorkspace.getVariableMap === "function"
            && targetWorkspace.getVariableMap()
            && typeof targetWorkspace.getVariableMap().createVariable === "function"
        ) {
            return targetWorkspace.getVariableMap().createVariable(name);
        }

        return null;
    };

    const hasDefaultVariable = typeof blocklyWorkspace.getVariable === "function"
        ? blocklyWorkspace.getVariable("my variable")
        : blocklyWorkspace.getVariableMap
            && blocklyWorkspace.getVariableMap().getVariable("my variable");

    if (!hasDefaultVariable) {
        createVariableCompat(blocklyWorkspace, "my variable");
    }

    blocklyWorkspace.registerButtonCallback("MIHU_CREATE_VARIABLE", (button) => {
        const targetWorkspace = button.getTargetWorkspace
            ? button.getTargetWorkspace()
            : blocklyWorkspace;

        if (Blockly.Variables && typeof Blockly.Variables.createVariableButtonHandler === "function") {
            Blockly.Variables.createVariableButtonHandler(targetWorkspace);
            return;
        }

        const name = window.prompt("Nome da variável:", "my variable");

        if (name) {
            createVariableCompat(targetWorkspace, name);

            if (typeof targetWorkspace.refreshToolboxSelection === "function") {
                targetWorkspace.refreshToolboxSelection();
            }
        }
    });
}

function setupCustomBlocksToolbox(blocklyWorkspace) {
    if (!blocklyWorkspace) {
        return;
    }

    blocklyWorkspace.registerButtonCallback("MIHU_CREATE_BLOCK", (button) => {
        const targetWorkspace = button.getTargetWorkspace
            ? button.getTargetWorkspace()
            : blocklyWorkspace;

        if (Blockly.Procedures && typeof Blockly.Procedures.createProcedureDefCallback === "function") {
            Blockly.Procedures.createProcedureDefCallback(targetWorkspace);
            return;
        }

        const block = targetWorkspace.newBlock("procedures_defnoreturn");
        block.setFieldValue("nome do bloco", "NAME");
        block.initSvg();
        block.render();
        block.moveBy(120, 80);
        targetWorkspace.centerOnBlock(block.id);
    });
}


// ==============================
// BLOCO INICIAL OPCIONAL
// ==============================

function ensureInitBlock() {
    /*
    if (workspace && !workspace.getTopBlocks(false).some(block => block.type === "mihu_setup_loop")) {
        const block = workspace.newBlock("mihu_setup_loop");
        block.initSvg();
        block.render();
        block.moveBy(40, 40);
    }
    */
}


// ==============================
// GERAÇÃO DE CÓDIGO PYTHON
// ==============================

/*
function generatePythonCode() {
    if (!workspace) {
        return "";
    }

    window.MIHU_IMPORTS = new Set();

    let code = Blockly.Python.workspaceToCode(workspace);

    if (Array.isArray(code)) {
        code = code[0];
    }

    code = code || "";

    let imports = "";

    if (window.MIHU_IMPORTS && window.MIHU_IMPORTS.size > 0) {
        imports = Array.from(window.MIHU_IMPORTS).join("\n") + "\n\n";
    }

    return imports + code;
}*/

function generatePythonCode() {
    if (!workspace) return "";

    try {
        // Limpa imports e setups antes de gerar novamente
        window.MIHU_IMPORTS = new Set();
        window.MIHU_SETUP = new Set();
        window.MIHU_USE_TASKS = false;
        window.mihuAddImport = window.mihuAddImport || function(importLine) {
            window.MIHU_IMPORTS.add(importLine);
        };
        window.mihuAddSetup = window.mihuAddSetup || function(setupLine) {
            window.MIHU_SETUP.add(setupLine);
        };

        let code = Blockly.Python.workspaceToCode(workspace);

        if (Array.isArray(code)) {
            code = code[0];
        }

        code = code || "";

        let imports = "";
        if (window.MIHU_IMPORTS && window.MIHU_IMPORTS.size > 0) {
            imports = Array.from(window.MIHU_IMPORTS).join("\n") + "\n\n";
        }

        let setup = "";
        if (window.MIHU_SETUP && window.MIHU_SETUP.size > 0) {
            setup = Array.from(window.MIHU_SETUP).join("\n") + "\n\n";
        }

        let footer = "";
        if (window.MIHU_USE_TASKS) {
            footer = "\niniciar_tarefas()\n";
        }

        return imports + setup + code + footer;
    } catch (error) {
        console.error("Erro ao gerar código Python:", error);
        return `# Erro ao gerar código:\n# ${error.message || error}`;
    }
}


// ==============================
// ATUALIZAÇÃO DO PREVIEW DE CÓDIGO
// ==============================

function updateCodePreview() {
    const program = typeof getCurrentProgram === "function" ? getCurrentProgram() : null;
    const code = program && program.customCodeActive
        ? (program.customCode || "")
        : generatePythonCode();

    if (typeof setMonacoCode === "function") setMonacoCode(code);
    if (typeof updateCodeSourceUI === "function") updateCodeSourceUI();
}


// ==============================
// REDIMENSIONAMENTO DO WORKSPACE
// ==============================

function resizeBlocklyWorkspace() {
    if (workspace) {
        Blockly.svgResize(workspace);
        setTimeout(applyDarkWorkspaceStyles, 50);
    }
}
