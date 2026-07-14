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

        const newBlocklyWidth = Math.max(
            200,
            Math.min(containerWidth - 200, startBlocklyWidth + deltaX)
        );

        const blocklyPercent = (newBlocklyWidth / containerWidth) * 100;
        const codePercent = 100 - blocklyPercent;

        blocklyDiv.style.flex = `0 0 ${blocklyPercent}%`;
        codePanel.style.width = `${codePercent}%`;

        if (workspace) {
            Blockly.svgResize(workspace);
        }

        if (typeof resizeMonacoEditor === "function") {
            resizeMonacoEditor();
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';

            if (workspace) {
                Blockly.svgResize(workspace);
            }

            if (typeof resizeMonacoEditor === "function") {
                resizeMonacoEditor();
            }
        }
    });
}

function setupTerminalResizer() {
    const handle = document.getElementById('terminalResizer');
    const terminal = document.querySelector('.terminal');
    if (!handle || !terminal) return;
    let resizing = false;
    let startY = 0;
    let startHeight = 0;

    handle.addEventListener('pointerdown', (event) => {
        resizing = true;
        startY = event.clientY;
        startHeight = terminal.offsetHeight;
        handle.setPointerCapture(event.pointerId);
        document.body.classList.add('is-resizing');
        document.body.style.cursor = 'row-resize';
        event.preventDefault();
    });
    handle.addEventListener('pointermove', (event) => {
        if (!resizing) return;
        const maxHeight = Math.max(160, window.innerHeight - 260);
        const height = Math.max(100, Math.min(maxHeight, startHeight + startY - event.clientY));
        terminal.style.height = `${height}px`;
        if (workspace) Blockly.svgResize(workspace);
        if (typeof resizeMonacoEditor === 'function') resizeMonacoEditor();
    });
    handle.addEventListener('pointerup', () => {
        resizing = false;
        document.body.classList.remove('is-resizing');
        document.body.style.cursor = '';
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
            updateCodePreview();
            blocklyDiv.style.display = "none";
            document.getElementById('resizer').style.display = "none";
            codePanel.style.width = "100%";
            codePanel.style.flex = "1";
            document.body.classList.add("code-mode");
            if (typeof setMonacoEditable === "function") setMonacoEditable(true);
            toggleMode.textContent = typeof window.mihuT === "function" ? window.mihuT("state.blockMode") : "Modo Blocos";
        } else {
            blocklyDiv.style.display = "block";
            document.getElementById('resizer').style.display = "block";
            codePanel.style.width = "35%";
            codePanel.style.flex = "none";
            document.body.classList.remove("code-mode");
            if (typeof setMonacoEditable === "function") setMonacoEditable(false);
            toggleMode.textContent = typeof window.mihuT === "function" ? window.mihuT("state.codeMode") : "Modo Código";

            setTimeout(() => {
                if (workspace) {
                    Blockly.svgResize(workspace);
                }
            }, 100);
        }

        setTimeout(() => {
            if (typeof resizeMonacoEditor === "function") {
                resizeMonacoEditor();
            }
        }, 120);
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + Enter: Executar código
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();

            const runBtn = document.getElementById('runBtn');
            if (runBtn && !runBtn.disabled) {
                runBtn.click();
            }
        }

        // Ctrl + S: Salvar e executar
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();

            const runSaveBtn = document.getElementById('runSaveBtn');
            if (runSaveBtn && !runSaveBtn.disabled) {
                runSaveBtn.click();
            }
        }

        // Ctrl + N: Novo programa
        if (e.ctrlKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();

            const newProgBtn = document.getElementById('newProg');
            if (newProgBtn && !newProgBtn.disabled) {
                newProgBtn.click();
            }
        }

        // Esc: Parar execução
        if (e.key === 'Escape') {
            const stopBtn = document.getElementById('stopBtn');
            if (stopBtn && !stopBtn.disabled) {
                stopBtn.click();
            }
        }
    });
}

// =====================================================
// HELPERS DE EXECUÇÃO
// =====================================================

function sleepMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setRunButtonsBusy(isBusy) {
    const runBtn = document.getElementById('runBtn');
    const runSaveBtn = document.getElementById('runSaveBtn');
    const newProgBtn = document.getElementById('newProg');
    const connectBtn = document.getElementById('connectBtn');
    const stopBtn = document.getElementById('stopBtn');

    if (runBtn) {
        runBtn.disabled = isBusy;
        runBtn.textContent = typeof window.mihuT === "function" ? window.mihuT(isBusy ? "state.running" : "actions.run") : (isBusy ? "Executando..." : "Executar");
    }

    if (runSaveBtn) {
        runSaveBtn.disabled = isBusy;
        runSaveBtn.textContent = typeof window.mihuT === "function" ? window.mihuT(isBusy ? "state.sending" : "state.send") : (isBusy ? "Enviando..." : "Enviar");
    }

    if (newProgBtn) {
        newProgBtn.disabled = isBusy;
    }

    if (connectBtn) {
        connectBtn.disabled = isBusy;
    }

    if (stopBtn) {
        stopBtn.disabled = false;
    }
}

function refreshGeneratedCode() {
    if (typeof updateCodePreview === "function") {
        updateCodePreview();
    }

    if (typeof getActiveProgramCode === "function") {
        return getActiveProgramCode();
    }

    if (typeof generatePythonCode === "function") {
        return generatePythonCode();
    }

    return "";
}

async function stopCurrentExecutionBeforeRun() {
    if (typeof isSerialConnected !== "undefined" && !isSerialConnected) {
        return;
    }

    try {
        if (typeof sendStopCommand === "function") {
            await sendStopCommand();

            // Pequena pausa para o MicroPython sair de while True / execução anterior
            await sleepMs(300);
        }
    } catch (error) {
        console.warn("Não foi possível parar a execução anterior:", error);

        if (typeof logToTerminal === "function") {
            logToTerminal("⚠️ Não foi possível parar a execução anterior automaticamente.", "sys");
        }
    }
}

async function runGeneratedCode() {
    setRunButtonsBusy(true);

    try {
        const code = refreshGeneratedCode();

        if (!code || !code.trim()) {
            if (typeof logToTerminal === "function") {
                logToTerminal("⚠️ Nenhum código para executar.", "sys");
            }
            return;
        }

        await stopCurrentExecutionBeforeRun();

        if (typeof executePythonCode === "function") {
            await executePythonCode(code);
        } else if (typeof logToTerminal === "function") {
            logToTerminal("❌ Função executePythonCode não encontrada.", "sys");
        }

    } catch (error) {
        console.error(error);

        if (typeof logToTerminal === "function") {
            logToTerminal(`❌ Erro ao executar: ${error.message}`, "sys");
        }
    } finally {
        setRunButtonsBusy(false);
        refreshGeneratedCode();
    }
}

async function runAndSaveGeneratedCode() {
    setRunButtonsBusy(true);

    try {
        const code = refreshGeneratedCode();

        if (!code || !code.trim()) {
            if (typeof logToTerminal === "function") {
                logToTerminal("⚠️ Nenhum código para enviar.", "sys");
            }
            return;
        }

        if (typeof getCurrentProgram !== "function") {
            if (typeof logToTerminal === "function") {
                logToTerminal("❌ Função getCurrentProgram não encontrada.", "sys");
            }
            return;
        }

        const program = getCurrentProgram();

        if (!program) {
            if (typeof logToTerminal === "function") {
                logToTerminal("⚠️ Nenhum programa ativo.", "sys");
            }
            return;
        }

        if (typeof getProgramFilename !== "function") {
            if (typeof logToTerminal === "function") {
                logToTerminal("❌ Função getProgramFilename não encontrada.", "sys");
            }
            return;
        }

        const filename = getProgramFilename(currentProgramId);

        await stopCurrentExecutionBeforeRun();

        if (typeof executeAndSave === "function") {
            await executeAndSave(code, filename);
        } else if (typeof logToTerminal === "function") {
            logToTerminal("❌ Função executeAndSave não encontrada.", "sys");
        }

    } catch (error) {
        console.error(error);

        if (typeof logToTerminal === "function") {
            logToTerminal(`❌ Erro ao enviar: ${error.message}`, "sys");
        }
    } finally {
        setRunButtonsBusy(false);
        refreshGeneratedCode();
    }
}

function getCurrentProgramPngName() {
    if (typeof getCurrentProgram === "function") {
        const program = getCurrentProgram();

        if (program && program.name) {
            return program.name
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, "") + ".png";
        }
    }

    return "programacao.png";
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function choosePngFileHandle(filename) {
    if (typeof window.showSaveFilePicker !== "function") {
        return null;
    }

    try {
        return await window.showSaveFilePicker({
            suggestedName: filename,
            types: [
                {
                    description: "Imagem PNG",
                    accept: {
                        "image/png": [".png"]
                    }
                }
            ]
        });
    } catch (error) {
        if (error && error.name === "AbortError") {
            return "cancelled";
        }

        console.warn("Salvar arquivo via picker indisponível:", error);
        return null;
    }
}

function renderWorkspacePngBlob(width, height, scale, svgText) {
    return new Promise((resolve, reject) => {
        const svgBase64 = btoa(unescape(encodeURIComponent(svgText)));
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width * scale;
            canvas.height = height * scale;

            const context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.scale(scale, scale);
            context.drawImage(image, 0, 0);

            if (typeof canvas.toBlob === "function") {
                canvas.toBlob((pngBlob) => {
                    if (pngBlob) {
                        resolve(pngBlob);
                    } else {
                        reject(new Error("canvas.toBlob retornou vazio."));
                    }
                }, "image/png");
                return;
            }

            const dataUrl = canvas.toDataURL("image/png");
            const binary = atob(dataUrl.split(",")[1]);
            const bytes = new Uint8Array(binary.length);

            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            resolve(new Blob([bytes], { type: "image/png" }));
        };

        image.onerror = () => {
            reject(new Error("Não foi possível renderizar a imagem SVG."));
        };

        image.src = `data:image/svg+xml;base64,${svgBase64}`;
    });
}

async function exportWorkspacePngTransparent() {
    if (!workspace) {
        alert("Workspace ainda não foi carregado.");
        return;
    }

    const blocks = workspace.getAllBlocks(false);

    if (!blocks.length) {
        alert("Não há blocos para exportar.");
        return;
    }

    const blockCanvas = workspace.svgBlockCanvas_;

    if (!blockCanvas || typeof blockCanvas.getBBox !== "function") {
        alert("Não foi possível capturar os blocos.");
        return;
    }

    const bbox = blockCanvas.getBBox();
    const padding = 24;
    const scale = 2;
    const width = Math.ceil(bbox.width + padding * 2);
    const height = Math.ceil(bbox.height + padding * 2);

    if (!width || !height) {
        alert("Não foi possível calcular o tamanho dos blocos.");
        return;
    }

    const filename = getCurrentProgramPngName();
    const fileHandle = await choosePngFileHandle(filename);

    if (fileHandle === "cancelled") {
        return;
    }

    const exportSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    exportSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    exportSvg.setAttribute("width", String(width));
    exportSvg.setAttribute("height", String(height));
    exportSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const defs = document.querySelector("#blocklyDiv svg defs");
    if (defs) {
        exportSvg.appendChild(defs.cloneNode(true));
    }

    const styles = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styles.textContent = `
        .blocklyText { font-family: "Segoe UI", Tahoma, sans-serif; font-weight: 600; fill: #000; }
        .blocklyEditableText text { fill: #000; }
        .blocklyPath { stroke: #1a252f; stroke-width: 1px; }
    `;
    exportSvg.appendChild(styles);

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", `translate(${padding - bbox.x}, ${padding - bbox.y})`);

    const clonedBlockCanvas = blockCanvas.cloneNode(true);
    clonedBlockCanvas.removeAttribute("transform");
    group.appendChild(clonedBlockCanvas);
    exportSvg.appendChild(group);

    const svgText = new XMLSerializer().serializeToString(exportSvg);

    try {
        const pngBlob = await renderWorkspacePngBlob(width, height, scale, svgText);

        if (fileHandle && typeof fileHandle.createWritable === "function") {
            const writable = await fileHandle.createWritable();
            await writable.write(pngBlob);
            await writable.close();
            return;
        }

        downloadBlob(pngBlob, filename);
    } catch (error) {
        console.error(error);
        alert("Não foi possível gerar o PNG.");
    }
}

// =====================================================
// EVENTOS DA INTERFACE
// =====================================================

function setupEventHandlers() {
    const newProgBtn = document.getElementById('newProg');
    const runBtn = document.getElementById('runBtn');
    const runSaveBtn = document.getElementById('runSaveBtn');
    const stopBtn = document.getElementById('stopBtn');
    const connectBtn = document.getElementById('connectBtn');
    const connectionType = document.getElementById('connectionType');
    const exportPngBtn = document.getElementById('exportPngBtn');

    // Botão Novo Programa
    if (newProgBtn) {
        newProgBtn.addEventListener('click', () => {
            if (typeof createNewProgram === "function") {
                createNewProgram();
            }

            refreshGeneratedCode();
        });
    }

    // Botão Executar
    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            await runGeneratedCode();
        });
    }

    // Botão Executar e Salvar
    if (runSaveBtn) {
        runSaveBtn.addEventListener('click', async () => {
            await runAndSaveGeneratedCode();
        });
    }

    // Botão Stop
    if (stopBtn) {
        stopBtn.addEventListener('click', async () => {
            try {
                if (typeof sendStopCommand === "function") {
                    await sendStopCommand();
                }

                await sleepMs(150);
                refreshGeneratedCode();

            } catch (error) {
                console.error(error);

                if (typeof logToTerminal === "function") {
                    logToTerminal(`❌ Erro ao parar execução: ${error.message}`, "sys");
                }
            }
        });
    }

    // Botão Conectar/Desconectar
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            try {
                const selectedConnection = connectionType ? connectionType.value : "usb";
                if (selectedConnection !== "usb") {
                    const connectionName = selectedConnection === "wifi" ? "Wi-Fi" : "Bluetooth";
                    if (typeof logToTerminal === "function") {
                        logToTerminal(`ℹ️ Conexão ${connectionName}: integração preparada para implementação.`, "sys");
                    }
                    return;
                }

                if (typeof isSerialConnected !== "undefined" && isSerialConnected) {
                    if (typeof disconnectSerial === "function") {
                        await disconnectSerial();
                    }
                } else {
                    if (!navigator.serial) throw new Error("Use Chrome ou Edge com suporte a Web Serial.");
                    const selectedPort = await navigator.serial.requestPort();
                    const portInfo = typeof selectedPort.getInfo === "function" ? selectedPort.getInfo() : {};
                    const isUpdatePort = typeof window.isFirmwareBootloaderPort === "function"
                        && window.isFirmwareBootloaderPort(portInfo);

                    if (isUpdatePort && typeof window.openFirmwareUpdaterWithPort === "function") {
                        await window.openFirmwareUpdaterWithPort(selectedPort);
                    } else if (typeof connectToSerial === "function") {
                        await connectToSerial(selectedPort);
                    }
                }
            } catch (error) {
                console.error(error);

                if (typeof logToTerminal === "function") {
                    logToTerminal(`❌ Erro na conexão: ${error.message}`, "sys");
                }
            }
        });
    }

    if (connectionType) {
        connectionType.addEventListener('change', () => {
            const isUsb = connectionType.value === "usb";
            connectBtn.textContent = "Conectar";
            connectBtn.title = isUsb
                ? "Conectar por cabo USB"
                : `${connectionType.options[connectionType.selectedIndex].text} ainda não configurado`;
        });
    }

    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', exportWorkspacePngTransparent);
    }

}

function initializeUIHandlers() {
    setupResizer();
    setupTerminalResizer();
    setupModeToggle();
    setupKeyboardShortcuts();
    setupEventHandlers();

    const resetButton = document.getElementById('resetToBlocksCode');
    if (resetButton) resetButton.addEventListener('click', resetActiveCodeToBlocks);

    refreshGeneratedCode();

    console.log("UI Handlers inicializados");
}
