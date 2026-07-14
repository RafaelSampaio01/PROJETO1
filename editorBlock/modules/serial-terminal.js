// modules/serial-terminal.js
// Conexão real com MicroPython via Web Serial API (Chrome/Edge).
// Suporta: conectar, terminal ao vivo, executar código em RAW REPL,
// salvar arquivo .py na pasta /programas da controladora,
// listar, ler, apagar e executar programas salvos.

// Estado da conexão serial
let isSerialConnected = false;

let _port = null;
let _reader = null;
let _writer = null;

let _rxTextBuffer = "";   // buffer global para waiters
let _waiters = [];        // filas de waitFor()

let _outLineEl = null;    // para stream sem quebrar demais as linhas
let _replMode = "unknown"; // "friendly" | "raw" | "unknown"
let _busy = false;        // evita rodar 2 execs ao mesmo tempo
let _terminalScrollLocked = false;

const _decoder = new TextDecoder();
const _encoder = new TextEncoder();


// =====================================================
// UTIL: TERMINAL
// =====================================================

function _isTerminalNearBottom(terminalEl, thresholdPx = 40) {
    const remaining = terminalEl.scrollHeight - terminalEl.scrollTop - terminalEl.clientHeight;
    return remaining < thresholdPx;
}

function logToTerminal(message, type = "sys") {
    const terminal = document.getElementById("terminal");
    if (!terminal) return;

    _outLineEl = null;

    const atBottom = _isTerminalNearBottom(terminal);

    const line = document.createElement("div");
    line.className = `terminal-line line-${type}`;
    line.textContent = message;

    terminal.appendChild(line);

    if (!_terminalScrollLocked && atBottom) terminal.scrollTop = terminal.scrollHeight;
}

function _appendDeviceTextToTerminal(text, type = "out") {
    const terminal = document.getElementById("terminal");
    if (!terminal) return;

    const atBottom = _isTerminalNearBottom(terminal);

    text = text.replace(/\r/g, "");

    const parts = text.split("\n");

    for (let i = 0; i < parts.length; i++) {
        const chunk = parts[i];

        if (i === 0) {
            if (!_outLineEl) {
                _outLineEl = document.createElement("div");
                _outLineEl.className = `terminal-line line-${type}`;
                _outLineEl.textContent = chunk;
                terminal.appendChild(_outLineEl);
            } else {
                _outLineEl.textContent += chunk;
            }
        } else {
            _outLineEl = document.createElement("div");
            _outLineEl.className = `terminal-line line-${type}`;
            _outLineEl.textContent = chunk;
            terminal.appendChild(_outLineEl);
        }
    }

    if (!_terminalScrollLocked && atBottom) terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
    const terminal = document.getElementById("terminal");
    if (terminal) {
        terminal.innerHTML = "";
    }
    _outLineEl = null;
}

function setTerminalScrollLocked(locked) {
    _terminalScrollLocked = Boolean(locked);
    const button = document.getElementById("lockTerminalScrollBtn");
    if (!button) return;

    button.setAttribute("aria-pressed", String(_terminalScrollLocked));
    button.classList.toggle("is-active", _terminalScrollLocked);
    button.textContent = typeof window.mihuT === "function"
        ? window.mihuT(_terminalScrollLocked ? "state.unlockScroll" : "state.lockScroll")
        : (_terminalScrollLocked ? "Liberar scroll" : "Travar scroll");
    button.title = typeof window.mihuT === "function"
        ? window.mihuT(_terminalScrollLocked ? "state.unlockScrollTitle" : "state.lockScrollTitle")
        : (_terminalScrollLocked ? "Permitir que novas mensagens acompanhem o final do terminal" : "Impedir que novas mensagens movam o scroll");
}

function setupTerminalControls() {
    const clearButton = document.getElementById("clearTerminalBtn");
    const lockButton = document.getElementById("lockTerminalScrollBtn");

    if (clearButton) clearButton.addEventListener("click", clearTerminal);
    if (lockButton) {
        lockButton.addEventListener("click", () => {
            setTerminalScrollLocked(!_terminalScrollLocked);
        });
    }

    setTerminalScrollLocked(false);
}

function updateConnectionUI(connected) {
    const connectBtn = document.getElementById("connectBtn");
    const sendBtn = document.getElementById("sendBtn");
    const statusDot = document.getElementById("connectionStatusDot");
    const connectionType = document.getElementById("connectionType");

    if (connectBtn) connectBtn.textContent = typeof window.mihuT === "function"
        ? window.mihuT(connected ? "state.disconnect" : "state.connect")
        : (connected ? "Desconectar" : "Conectar");
    if (sendBtn) sendBtn.disabled = !connected;
    if (statusDot) statusDot.classList.toggle("is-connected", connected);
    if (connectionType) connectionType.disabled = connected;

    isSerialConnected = connected;
    window.dispatchEvent(new CustomEvent("mihu:serial-connection", {detail: {connected}}));
}

function isBoardSerialConnected() { return isSerialConnected; }


// =====================================================
// UTIL: RX WAITERS
// =====================================================

function _pushRx(text) {
    _rxTextBuffer += text;

    if (_rxTextBuffer.length > 200000) {
        _rxTextBuffer = _rxTextBuffer.slice(-100000);
    }

    for (let i = _waiters.length - 1; i >= 0; i--) {
        const w = _waiters[i];

        if (_rxTextBuffer.includes(w.pattern)) {
            clearTimeout(w.timeoutId);
            _waiters.splice(i, 1);
            w.resolve(true);
        }
    }
}

function _waitFor(pattern, timeoutMs = 2000) {
    return new Promise((resolve, reject) => {
        if (_rxTextBuffer.includes(pattern)) return resolve(true);

        const timeoutId = setTimeout(() => {
            const idx = _waiters.findIndex(x => x.timeoutId === timeoutId);
            if (idx >= 0) _waiters.splice(idx, 1);

            reject(new Error(`Timeout esperando: ${JSON.stringify(pattern)}`));
        }, timeoutMs);

        _waiters.push({
            pattern,
            resolve,
            reject,
            timeoutId
        });
    });
}

function _consumeUntil(pattern) {
    const idx = _rxTextBuffer.indexOf(pattern);

    if (idx >= 0) {
        const out = _rxTextBuffer.slice(0, idx + pattern.length);
        _rxTextBuffer = _rxTextBuffer.slice(idx + pattern.length);
        return out;
    }

    return null;
}

async function _readUntil(pattern, timeoutMs = 4000) {
    await _waitFor(pattern, timeoutMs);
    return _consumeUntil(pattern);
}


// =====================================================
// UTIL: TX
// =====================================================

async function _sendText(str) {
    if (!_writer) throw new Error("Writer não inicializado");
    await _writer.write(_encoder.encode(str));
}

async function _sendBytes(bytes) {
    if (!_writer) throw new Error("Writer não inicializado");
    await _writer.write(new Uint8Array(bytes));
}

async function _sendCtrl(ch) {
    const map = {
        "A": 0x01,
        "B": 0x02,
        "C": 0x03,
        "D": 0x04
    };

    const code = map[ch.toUpperCase()];

    if (!code) throw new Error(`Ctrl-${ch} inválido`);

    await _sendBytes([code]);
}


// =====================================================
// PROTOCOLO: REPL
// =====================================================

async function _ensureFriendlyRepl() {
    if (!isSerialConnected) return;

    try {
        await _sendCtrl("C");
        await _sendCtrl("C");
        await _sendCtrl("B");
        await _sendText("\r\n");

        await _waitFor(">>>", 1200);

        _replMode = "friendly";
    } catch (e) {
        _replMode = "unknown";
    }
}

async function _enterRawRepl() {
    if (!isSerialConnected) throw new Error("Sem conexão");

    await _sendCtrl("C");
    await _sendCtrl("C");
    await _sendCtrl("A");

    await _waitFor("raw REPL", 1500).catch(() => {});
    await _waitFor(">", 1500).catch(() => {});

    _replMode = "raw";
}

async function _exitRawReplToFriendly() {
    if (!isSerialConnected) return;

    try {
        await _sendCtrl("B");
        await _sendText("\r\n");

        await _waitFor(">>>", 1500);

        _replMode = "friendly";
    } catch (e) {
        _replMode = "unknown";
    }
}

async function _execRaw(code) {
    await _enterRawRepl();

    _rxTextBuffer = "";

    await _sendText(code);

    if (!code.endsWith("\n")) {
        await _sendText("\n");
    }

    await _sendCtrl("D");

    await _readUntil("OK", 2500).catch(() => {});

    const outChunk = await _readUntil("\x04", 8000).catch(() => "");
    const stdout = (outChunk || "").replace(/\x04/g, "");

    const errChunk = await _readUntil("\x04", 8000).catch(() => "");
    const stderr = (errChunk || "").replace(/\x04/g, "");

    await _waitFor(">", 2000).catch(() => {});

    return {
        stdout,
        stderr
    };
}


// =====================================================
// CONEXÃO SERIAL - WEB SERIAL API
// =====================================================

async function connectToSerial(selectedPort = null) {
    if (!("serial" in navigator)) {
        logToTerminal("❌ Seu navegador não suporta Web Serial. Use Chrome/Edge desktop.", "sys");
        return false;
    }

    try {
        logToTerminal("Conectando... selecione a porta serial do MIHU/ESP32.", "sys");

        _port = selectedPort || await navigator.serial.requestPort();

        await _port.open({
            baudRate: 115200
        });

        _writer = _port.writable.getWriter();
        _reader = _port.readable.getReader();

        updateConnectionUI(true);
        logToTerminal("✅ Conectado via USB Serial", "sys");

        _startReadLoop();

        await _ensureFriendlyRepl();

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Falha ao conectar: ${error.message}`, "sys");

        await disconnectSerial();

        return false;
    }
}

async function disconnectSerial() {
    try {
        updateConnectionUI(false);

        if (_reader) {
            try {
                await _reader.cancel();
            } catch (_) {}

            try {
                _reader.releaseLock();
            } catch (_) {}

            _reader = null;
        }

        if (_writer) {
            try {
                _writer.releaseLock();
            } catch (_) {}

            _writer = null;
        }

        if (_port) {
            try {
                await _port.close();
            } catch (_) {}

            _port = null;
        }

        _replMode = "unknown";
        _rxTextBuffer = "";
        _waiters = [];

        logToTerminal("Desconectado.", "sys");
    } catch (e) {
        console.warn("Erro ao desconectar:", e);
    }
}

async function _startReadLoop() {
    if (!_reader) return;

    (async () => {
        try {
            while (isSerialConnected && _reader) {
                const {
                    value,
                    done
                } = await _reader.read();

                if (done) break;
                if (!value) continue;

                const text = _decoder.decode(value, {
                    stream: true
                });

                _appendDeviceTextToTerminal(text, "out");
                _pushRx(text);
            }
        } catch (e) {
            console.warn("Leitura serial encerrada:", e);
        } finally {
            if (isSerialConnected) {
                updateConnectionUI(false);
                logToTerminal("⚠️ Conexão serial encerrada.", "sys");
            }
        }
    })();
}


// =====================================================
// UTIL: PROGRAMAS SALVOS
// =====================================================

function _toBase64Utf8(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function _sanitizeProgramFilename(filename) {
    if (!filename || !filename.trim()) {
        filename = "programa.py";
    }

    filename = filename.trim();

    // Remove caminhos, mantendo apenas o nome do arquivo.
    filename = filename.replace(/\\/g, "/");
    filename = filename.split("/").pop();

    // Remove caracteres problemáticos para MicroPython.
    filename = filename.replace(/[^a-zA-Z0-9_\-.]/g, "_");

    if (!filename.endsWith(".py")) {
        filename += ".py";
    }

    return filename;
}

function _getProgramPath(filename) {
    const safeName = _sanitizeProgramFilename(filename);
    return `/programas/${safeName}`;
}


// =====================================================
// EXECUÇÃO / SALVAMENTO
// =====================================================

async function executePythonCode(code) {
    if (!isSerialConnected) {
        logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
        return false;
    }

    if (_busy) {
        logToTerminal("⚠️ Já existe uma execução em andamento.", "sys");
        return false;
    }

    if (!code || !code.trim()) {
        logToTerminal("⚠️ Nenhum código para executar", "sys");
        return false;
    }

    _busy = true;

    try {
        logToTerminal("🚀 Executando em RAW REPL...", "sys");

        const {
            stdout,
            stderr
        } = await _execRaw(code);

        if (stdout && stdout.trim()) {
            _appendDeviceTextToTerminal(stdout + "\n", "out");
        }

        if (stderr && stderr.trim()) {
            _appendDeviceTextToTerminal(stderr + "\n", "sys");
        }

        logToTerminal("✅ Execução concluída", "sys");

        await _exitRawReplToFriendly();

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro na execução: ${error.message}`, "sys");

        await _exitRawReplToFriendly();

        return false;
    } finally {
        _busy = false;
    }
}

async function executeAndSave(code, filename) {
    if (!isSerialConnected) {
        logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
        return false;
    }

    if (_busy) {
        logToTerminal("⚠️ Já existe uma execução em andamento.", "sys");
        return false;
    }

    if (!code || !code.trim()) {
        logToTerminal("⚠️ Nenhum código para salvar", "sys");
        return false;
    }

    const safeName = _sanitizeProgramFilename(filename);
    const programPath = _getProgramPath(safeName);

    _busy = true;

    try {
        logToTerminal(`💾 Salvando programa em: ${programPath}`, "sys");

        const b64 = _toBase64Utf8(code);

    const py = [
        "import os",
        "import ubinascii",
        "",
        "try:",
        "    os.listdir('/programas')",
        "except:",
        "    os.mkdir('/programas')",
        "",
        `data = ubinascii.a2b_base64('${b64}')`,
        `filename = '${programPath}'`,
        "f = open(filename, 'wb')",
        "f.write(data)",
        "f.close()",
        "",
        "try:",
        "    import mihuConfig as mihuConfig",
        "    mihuConfig.setLastProgram(filename)",
        "    print('Last program:', filename)",
        "except Exception as e:",
        "    print('Erro last program:', e)",
        "",
        "print('Saved:', filename)"
    ].join("\n");

        const {
            stdout,
            stderr
        } = await _execRaw(py);

        if (stdout && stdout.trim()) {
            _appendDeviceTextToTerminal(stdout + "\n", "out");
        }

        if (stderr && stderr.trim()) {
            _appendDeviceTextToTerminal(stderr + "\n", "sys");
        }

        logToTerminal("✅ Programa salvo na pasta /programas", "sys");
        logToTerminal("🔄 Reiniciando para voltar ao menu principal...", "sys");

        await _exitRawReplToFriendly();

        await softResetEsp32();

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro ao salvar programa: ${error.message}`, "sys");

        await _exitRawReplToFriendly();

        return false;
    } finally {
        _busy = false;
    }
}

let _lastStopCommandAt = 0;

async function sendStopCommand() {
    if (!isSerialConnected) {
        logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
        return false;
    }

    const now = Date.now();

    // Evita disparo duplo do botão STOP
    if (now - _lastStopCommandAt < 800) {
        return false;
    }

    _lastStopCommandAt = now;

    try {
        logToTerminal("⏹️ Parando programa...", "sys");

        // Envia apenas um Ctrl+C.
        // O mihuProgramas.py captura KeyboardInterrupt e retorna ao menu.
        await _sendCtrl("C");

        logToTerminal("✅ STOP enviado", "sys");

        return true;
    } catch (e) {
        console.error(e);
        logToTerminal("⚠️ Falha ao enviar STOP.", "sys");
        return false;
    }
}

async function _sendReplLine(line) {
    if (!isSerialConnected) return;

    if (_replMode !== "friendly") {
        await _ensureFriendlyRepl();
    }

    await _sendText(line + "\r\n");
}


// =====================================================
// ARQUIVOS NO ESP32 / MICROPYTHON
// =====================================================

async function listFilesEsp32(path = "/programas") {
    if (!isSerialConnected) {
        logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
        return false;
    }

    if (_busy) {
        logToTerminal("⚠️ Já existe uma operação em andamento.", "sys");
        return false;
    }

    _busy = true;

    try {
        logToTerminal(`📁 Listando arquivos em: ${path}`, "sys");

        const py = [
            "import os",
            `path = '${path}'`,
            "",
            "if path == '/programas':",
            "    try:",
            "        os.listdir('/programas')",
            "    except:",
            "        os.mkdir('/programas')",
            "",
            "try:",
            "    files = os.listdir(path)",
            "    if len(files) == 0:",
            "        print('Pasta vazia')",
            "    else:",
            "        for f in files:",
            "            print(f)",
            "except Exception as e:",
            "    print('ERRO:', e)"
        ].join("\n");

        const {
            stdout,
            stderr
        } = await _execRaw(py);

        if (stdout && stdout.trim()) {
            _appendDeviceTextToTerminal(stdout + "\n", "out");
        } else {
            logToTerminal("Nenhum arquivo encontrado ou pasta vazia.", "sys");
        }

        if (stderr && stderr.trim()) {
            _appendDeviceTextToTerminal(stderr + "\n", "sys");
        }

        await _exitRawReplToFriendly();

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro ao listar arquivos: ${error.message}`, "sys");

        await _exitRawReplToFriendly();

        return false;
    } finally {
        _busy = false;
    }
}

async function readFileEsp32(filename = "/programas/programa.py") {
    if (!isSerialConnected) {
        logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
        return false;
    }

    if (_busy) {
        logToTerminal("⚠️ Já existe uma operação em andamento.", "sys");
        return false;
    }

    _busy = true;

    try {
        logToTerminal(`📖 Lendo arquivo: ${filename}`, "sys");

        const py = [
            `filename = '${filename}'`,
            "try:",
            "    f = open(filename, 'r')",
            "    data = f.read()",
            "    f.close()",
            "    print(data)",
            "except Exception as e:",
            "    print('ERRO:', e)"
        ].join("\n");

        const {
            stdout,
            stderr
        } = await _execRaw(py);

        if (stdout && stdout.trim()) {
            logToTerminal(`Conteúdo de ${filename}:`, "sys");
            _appendDeviceTextToTerminal(stdout + "\n", "out");
        }

        if (stderr && stderr.trim()) {
            _appendDeviceTextToTerminal(stderr + "\n", "sys");
        }

        await _exitRawReplToFriendly();

        return stdout;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro ao ler arquivo: ${error.message}`, "sys");

        await _exitRawReplToFriendly();

        return false;
    } finally {
        _busy = false;
    }
}

async function deleteFileEsp32(filename = "/programas/programa.py") {
    if (!isSerialConnected) {
        logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
        return false;
    }

    if (_busy) {
        logToTerminal("⚠️ Já existe uma operação em andamento.", "sys");
        return false;
    }

    _busy = true;

    try {
        logToTerminal(`🗑️ Apagando arquivo: ${filename}`, "sys");

        const py = [
            "import os",
            `filename = '${filename}'`,
            "try:",
            "    os.remove(filename)",
            "    print('Arquivo removido:', filename)",
            "except Exception as e:",
            "    print('ERRO:', e)"
        ].join("\n");

        const {
            stdout,
            stderr
        } = await _execRaw(py);

        if (stdout && stdout.trim()) {
            _appendDeviceTextToTerminal(stdout + "\n", "out");
        }

        if (stderr && stderr.trim()) {
            _appendDeviceTextToTerminal(stderr + "\n", "sys");
        }

        await _exitRawReplToFriendly();

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro ao apagar arquivo: ${error.message}`, "sys");

        await _exitRawReplToFriendly();

        return false;
    } finally {
        _busy = false;
    }
}

async function runFileEsp32(filename = "/programas/programa.py") {
    if (!isSerialConnected) {
        logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
        return false;
    }

    if (_busy) {
        logToTerminal("⚠️ Já existe uma operação em andamento.", "sys");
        return false;
    }

    _busy = true;

    try {
        logToTerminal(`▶️ Executando arquivo: ${filename}`, "sys");

        const py = [
            `filename = '${filename}'`,
            "try:",
            "    namespace = {'__name__': '__main__', '__file__': filename}",
            "    exec(open(filename).read(), namespace)",
            "    if 'main' in namespace:",
            "        namespace['main']()",
            "except Exception as e:",
            "    print('ERRO:', e)"
        ].join("\n");

        const {
            stdout,
            stderr
        } = await _execRaw(py);

        if (stdout && stdout.trim()) {
            _appendDeviceTextToTerminal(stdout + "\n", "out");
        }

        if (stderr && stderr.trim()) {
            _appendDeviceTextToTerminal(stderr + "\n", "sys");
        }

        await _exitRawReplToFriendly();

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro ao executar arquivo: ${error.message}`, "sys");

        await _exitRawReplToFriendly();

        return false;
    } finally {
        _busy = false;
    }
}

async function softResetEsp32() {
    if (!isSerialConnected) {
        logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
        return false;
    }

    try {
        logToTerminal("🔄 Reiniciando MicroPython com Ctrl+D...", "sys");

        await _ensureFriendlyRepl();
        await _sendCtrl("D");

        logToTerminal("✅ Soft reset enviado", "sys");

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro ao reiniciar: ${error.message}`, "sys");

        return false;
    }
}


// =====================================================
// COMANDOS DO TERMINAL
// =====================================================

async function processTerminalCommand(command) {
    const cmd = command.trim();

    if (cmd === ":help" || cmd === "help") {
        logToTerminal("Comandos locais:", "sys");
        logToTerminal("  help / :help        - Mostra esta ajuda", "sys");
        logToTerminal("  clear               - Limpa o terminal", "sys");
        logToTerminal("  status              - Mostra status da conexão", "sys");
        logToTerminal("  code                - Mostra código atual", "sys");
        logToTerminal("  blocks              - Conta blocos no workspace", "sys");
        logToTerminal("  connect             - Conectar à controladora", "sys");
        logToTerminal("  disconnect          - Desconectar da controladora", "sys");
        logToTerminal("  :ls                 - Lista programas em /programas", "sys");
        logToTerminal("  :read teste.py      - Lê um programa salvo", "sys");
        logToTerminal("  :cat teste.py       - Mesmo que :read", "sys");
        logToTerminal("  :rm teste.py        - Apaga um programa salvo", "sys");
        logToTerminal("  :run teste.py       - Executa um programa salvo", "sys");
        logToTerminal("  :reset              - Reinicia o MicroPython", "sys");
        logToTerminal("  :raw                - Entrar em RAW REPL", "sys");
        logToTerminal("  :friendly           - Voltar para >>>", "sys");
        return;
    }

    if (cmd === "clear") {
        clearTerminal();
        logToTerminal("Terminal limpo.", "sys");
        return;
    }

    if (cmd === "status") {
        logToTerminal(`Status: ${isSerialConnected ? "Conectado" : "Desconectado"} | REPL: ${_replMode}`, "sys");
        return;
    }

    if (cmd === "code") {
        if (typeof generatePythonCode === "function") {
            const code = generatePythonCode();
            logToTerminal("Código atual:", "sys");
            logToTerminal(code || "# Vazio", "out");
        } else {
            logToTerminal("⚠️ Função generatePythonCode não encontrada.", "sys");
        }

        return;
    }

    if (cmd === "blocks") {
        if (typeof workspace !== "undefined" && workspace) {
            const blocks = workspace.getAllBlocks();
            logToTerminal(`Blocos no workspace: ${blocks.length}`, "sys");
        } else {
            logToTerminal("⚠️ Workspace não encontrado.", "sys");
        }

        return;
    }

    if (cmd === "connect") {
        await connectToSerial();
        return;
    }

    if (cmd === "disconnect") {
        await disconnectSerial();
        return;
    }

    if (cmd === ":ls" || cmd === "ls") {
        await listFilesEsp32("/programas");
        return;
    }

    if (cmd.startsWith(":read ") || cmd.startsWith(":cat ")) {
        const parts = cmd.split(/\s+/);
        const filename = parts[1] || "programa.py";
        const programPath = _getProgramPath(filename);

        await readFileEsp32(programPath);

        return;
    }

    if (cmd.startsWith(":rm ")) {
        const parts = cmd.split(/\s+/);
        const filename = parts[1];

        if (!filename) {
            logToTerminal("⚠️ Informe o nome do programa. Exemplo: :rm teste.py", "sys");
            return;
        }

        const programPath = _getProgramPath(filename);

        await deleteFileEsp32(programPath);

        return;
    }

    if (cmd.startsWith(":run ")) {
        const parts = cmd.split(/\s+/);
        const filename = parts[1] || "programa.py";
        const programPath = _getProgramPath(filename);

        await runFileEsp32(programPath);

        return;
    }

    if (cmd === ":reset" || cmd === "reset") {
        await softResetEsp32();
        return;
    }

    if (cmd === ":raw") {
        if (!isSerialConnected) {
            logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
            return;
        }

        await _enterRawRepl().catch(() => {});
        logToTerminal("RAW REPL ativo. Para voltar: :friendly", "sys");

        return;
    }

    if (cmd === ":friendly") {
        if (!isSerialConnected) {
            logToTerminal("❌ Conecte-se primeiro à controladora", "sys");
            return;
        }

        await _ensureFriendlyRepl();
        logToTerminal("REPL amigável >>> ativo.", "sys");

        return;
    }

    if (isSerialConnected) {
        await _sendReplLine(cmd);
        return;
    }

    logToTerminal('⚠️ Sem conexão. Use "connect".', "sys");
}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

function initializeTerminal() {
    clearTerminal();
    setupTerminalControls();

    logToTerminal(window.mihuT?.("terminal.welcome") || "MIHU STUDIO Terminal inicializado", "sys");
    logToTerminal(window.mihuT?.("terminal.helpHint") || "Digite 'help' para ver comandos locais. Para MicroPython, use comandos normais, por exemplo: help()", "sys");

    const terminalInput = document.getElementById("command");
    const sendBtn = document.getElementById("sendBtn");

    if (terminalInput && sendBtn) {
        terminalInput.addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {
                e.preventDefault();

                const command = terminalInput.value.trim();

                if (command) {
                    logToTerminal(`> ${command}`, "in");
                    terminalInput.value = "";

                    await processTerminalCommand(command);
                }
            }
        });

        sendBtn.addEventListener("click", async () => {
            const command = terminalInput.value.trim();

            if (command) {
                logToTerminal(`> ${command}`, "in");
                terminalInput.value = "";

                await processTerminalCommand(command);
            }
        });
    }

    console.log("Terminal inicializado");
}

function _fromBase64Utf8(value) {
    const binary = atob(value || "");
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function _pythonString(value) { return JSON.stringify(String(value)); }

async function _boardFileOperation(code) {
    if (!isSerialConnected) throw new Error("Conecte a controladora primeiro.");
    if (_busy) throw new Error("Aguarde a operação atual terminar.");
    _busy = true;
    try {
        const result = await _execRaw(code);
        await _exitRawReplToFriendly();
        if (result.stderr && result.stderr.trim()) throw new Error(result.stderr.trim());
        return result.stdout || "";
    } finally {
        _busy = false;
    }
}

async function getBoardFileTree() {
    const marker = "__MIHU_TREE__";
    const code = [
        "import os", "import ujson", "def walk(path):", "    result = []",
        "    try:", "        names = os.listdir(path)", "    except:", "        return result",
        "    for name in names:", "        full = (path.rstrip('/') + '/' + name) if path != '/' else '/' + name",
        "        try:", "            mode = os.stat(full)[0]", "            folder = (mode & 0x4000) != 0",
        "        except:", "            folder = False", "        item = {'name': name, 'path': full, 'type': 'folder' if folder else 'file'}",
        "        if folder:", "            item['children'] = walk(full)", "        result.append(item)",
        "    result.sort(key=lambda x: (x['type'] != 'folder', x['name'].lower()))", "    return result",
        `print('${marker}' + ujson.dumps(walk('/')))`
    ].join("\n");
    const output = await _boardFileOperation(code);
    const line = output.split(/\r?\n/).find(item => item.startsWith(marker));
    if (!line) throw new Error("A placa não retornou a árvore de arquivos.");
    return JSON.parse(line.slice(marker.length));
}

async function getBoardFile(path) {
    const marker = "__MIHU_FILE__";
    const code = ["import ubinascii", `f=open(${_pythonString(path)},'rb')`, "data=f.read()", "f.close()", `print('${marker}' + ubinascii.b2a_base64(data).decode().strip())`].join("\n");
    const output = await _boardFileOperation(code);
    const line = output.split(/\r?\n/).find(item => item.startsWith(marker));
    if (!line) throw new Error("Não foi possível ler o arquivo.");
    return _fromBase64Utf8(line.slice(marker.length));
}

async function saveBoardFile(path, content) {
    const encoded = _toBase64Utf8(content);
    const code = ["import ubinascii", `data=ubinascii.a2b_base64('${encoded}')`, `f=open(${_pythonString(path)},'wb')`, "f.write(data)", "f.close()", "print('__MIHU_SAVED__')"].join("\n");
    const output = await _boardFileOperation(code);
    if (!output.includes("__MIHU_SAVED__")) throw new Error("A placa não confirmou o salvamento.");
    return true;
}
