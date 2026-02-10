// modules/program-manager.js

// Constantes
const AUTOSAVE_KEY = "mihu_studio_state";

// Estado global
let programs = {};
let currentProgramId = null;
let programCounter = 0;

// ===== FUNÇÕES DE AUTOSAVE =====
function autosaveAll() {
    const data = {
        programs,
        currentProgramId,
        programCounter,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
}

function autoloadAll() {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return false;
    
    try {
        const data = JSON.parse(raw);
        if (!data.programs || Object.keys(data.programs).length === 0) {
            return false;
        }
        
        programs = data.programs;
        currentProgramId = data.currentProgramId;
        programCounter = data.programCounter || Object.keys(programs).length;
        
        console.log(`Carregados ${Object.keys(programs).length} programas do autosave`);
        return true;
    } catch(e) {
        console.warn("Autosave inválido:", e);
        return false;
    }
}

// ===== GERENCIAMENTO DE PROGRAMAS =====
function saveActiveProgram() {
    if (!currentProgramId || !workspace) return false;
    
    try {
        const state = Blockly.serialization.workspaces.save(workspace);
        programs[currentProgramId].state = state;
        programs[currentProgramId].lastModified = new Date().toISOString();
        autosaveAll();
        return true;
    } catch(e) {
        console.error("Erro ao salvar programa:", e);
        return false;
    }
}

function loadProgram(id) {
    if (!workspace || !programs[id]) return false;
    
    try {
        // Salvar programa atual primeiro
        saveActiveProgram();
        
        // Limpar e carregar novo
        workspace.clear();
        
        if (programs[id].state) {
            Blockly.serialization.workspaces.load(programs[id].state, workspace);
        }
        
        ensureInitBlock();
        currentProgramId = id;
        updateTabs();
        updateCodePreview();
        
        // Redimensionar
        setTimeout(() => {
            if (workspace) {
                Blockly.svgResize(workspace);
            }
        }, 100);
        
        console.log(`Programa carregado: ${programs[id].name}`);
        return true;
    } catch(e) {
        console.error("Erro ao carregar programa:", e);
        return false;
    }
}

function createNewProgram(name = null) {
    // Salvar programa atual
    saveActiveProgram();
    
    // Criar novo ID
    programCounter++;
    const id = `prog_${programCounter}`;
    
    // Nome do programa
    const programName = name || `Projeto${programCounter}`;
    
    // Inicializar programa
    programs[id] = {
        name: programName,
        state: null,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    // Limpar workspace
    if (workspace) {
        workspace.clear();
        ensureInitBlock();
        
        // Salvar estado inicial
        programs[id].state = Blockly.serialization.workspaces.save(workspace);
    }
    
    // Definir como ativo
    currentProgramId = id;
    updateTabs();
    autosaveAll();
    
    console.log(`Novo programa criado: ${programName}`);
    return id;
}

function deleteProgram(id) {
    // Verificar se existe
    if (!programs[id]) return false;
    
    // Verificar se é o último programa
    if (Object.keys(programs).length <= 1) {
        alert("É necessário manter pelo menos um programa.");
        return false;
    }
    
    const programName = programs[id].name;
    const wasActive = (id === currentProgramId);
    
    // Excluir
    delete programs[id];
    
    // Se era o ativo, carregar outro
    if (wasActive) {
        const remainingIds = Object.keys(programs);
        if (remainingIds.length > 0) {
            loadProgram(remainingIds[0]);
        }
    } else {
        updateTabs();
    }
    
    autosaveAll();
    console.log(`Programa excluído: ${programName}`);
    return true;
}

function renameProgram(id, newName) {
    if (!programs[id] || !newName || newName.trim() === "") return false;
    
    const oldName = programs[id].name;
    programs[id].name = newName.trim();
    programs[id].lastModified = new Date().toISOString();
    
    updateTabs();
    autosaveAll();
    
    console.log(`Programa renomeado: "${oldName}" → "${newName}"`);
    return true;
}

function getCurrentProgram() {
    return programs[currentProgramId];
}

function getAllPrograms() {
    return programs;
}

function getProgramFilename(id) {
    if (!programs[id]) return "programa.py";
    
    return programs[id].name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "") + ".py";
}

// ===== INTERFACE =====
function updateTabs() {
    const tabsContainer = document.getElementById('programTabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = "";
    
    Object.keys(programs).forEach(id => {
        const program = programs[id];
        
        // Criar tab
        const tab = document.createElement("div");
        tab.className = "program-tab" + (id === currentProgramId ? " active" : "");
        tab.dataset.programId = id;
        
        // Nome
        const nameSpan = document.createElement("span");
        nameSpan.className = "tab-name";
        nameSpan.textContent = program.name;
        
        // Botão fechar
        const closeBtn = document.createElement("span");
        closeBtn.className = "tab-close";
        closeBtn.textContent = "×";
        closeBtn.title = "Excluir programa";
        
        // Montar
        tab.appendChild(nameSpan);
        tab.appendChild(closeBtn);
        tabsContainer.appendChild(tab);
        
        // Eventos
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                if (id !== currentProgramId) {
                    loadProgram(id);
                }
            }
        });
        
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Excluir "${program.name}"?`)) {
                deleteProgram(id);
            }
        });
        
        tab.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const newName = prompt("Novo nome:", program.name);
            if (newName && newName !== program.name) {
                renameProgram(id, newName);
            }
        });
    });
}

// ===== INICIALIZAÇÃO =====
function initializeProgramManager() {
    // Carregar programas salvos
    const loaded = autoloadAll();
    
    // Se não tinha nada salvo, criar primeiro programa
    if (!loaded) {
        createNewProgram("Projeto1");
    } else if (currentProgramId && programs[currentProgramId]) {
        // Carregar programa salvo
        loadProgram(currentProgramId);
    } else {
        // Carregar primeiro programa disponível
        const firstId = Object.keys(programs)[0];
        if (firstId) {
            loadProgram(firstId);
        } else {
            createNewProgram("Projeto1");
        }
    }
    
    console.log("Program Manager inicializado");
}