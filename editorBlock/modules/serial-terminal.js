// modules/serial-terminal.js
// Conexão real com MicroPython via Web Serial API (Chrome/Edge).
// Suporta: conectar, terminal ao vivo, executar código em RAW REPL e salvar arquivo .py na controladora.

// Estado da conexão serial
let isSerialConnected = false;

let _port = null;
let _reader = null;
let _writer = null;

let _rxTextBuffer = "";   // buffer global (para waiters)
let _waiters = [];        // filas de waitFor()

let _outLineEl = null;    // para "stream" sem quebrar demais as linhas
let _replMode = "unknown"; // "friendly" | "raw" | "unknown"
let _busy = false;        // evita rodar 2 execs ao mesmo tempo

const _decoder = new TextDecoder();
const _encoder = new TextEncoder();

// ===== UTIL: TERMINAL =====
function _isTerminalNearBottom(terminalEl, thresholdPx = 40) {
    const remaining = terminalEl.scrollHeight - terminalEl.scrollTop - terminalEl.clientHeight;
    return remaining < thresholdPx;
}

function logToTerminal(message, type = "sys") {
    const terminal = document.getElementById('terminal');
    if (!terminal) return;

    // Se já existe linha em streaming, fecha ela para manter linhas "sistêmicas" separadas
    _outLineEl = null;

    const atBottom = _isTerminalNearBottom(terminal);

    const line = document.createElement("div");
    line.className = `terminal-line line-${type}`;
    line.textContent = message;

    terminal.appendChild(line);

    if (atBottom) terminal.scrollTop = terminal.scrollHeight;
}

function _appendDeviceTextToTerminal(text, type = "out") {
    const terminal = document.getElementById('terminal');
    if (!terminal) return;

    const atBottom = _isTerminalNearBottom(terminal);

    // normaliza CR
    text = text.replace(/\r/g, "");

    // split por \n mantendo streaming
    const parts = text.split("\n");

    for (let i = 0; i < parts.length; i++) {
        const chunk = parts[i];

        // primeira parte: completa na linha atual
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
            // nova linha
            _outLineEl = document.createElement("div");
            _outLineEl.className = `terminal-line line-${type}`;
            _outLineEl.textContent = chunk;
            terminal.appendChild(_outLineEl);
        }
    }

    if (atBottom) terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.innerHTML = "";
    }
    _outLineEl = null;
}

function updateConnectionUI(connected) {
    const connectBtn = document.getElementById('connectBtn');
    const sendBtn = document.getElementById('sendBtn');

    if (connectBtn) connectBtn.textContent = connected ? "Desconectar" : "Conectar";
    if (sendBtn) sendBtn.disabled = !connected;

    isSerialConnected = connected;
}

// ===== UTIL: RX WAITERS =====
function _pushRx(text) {
    _rxTextBuffer += text;

    // evita buffer infinito
    if (_rxTextBuffer.length > 200_000) {
        _rxTextBuffer = _rxTextBuffer.slice(-100_000);
    }

    // resolve waiters
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
            // remove waiter
            const idx = _waiters.findIndex(x => x.timeoutId === timeoutId);
            if (idx >= 0) _waiters.splice(idx, 1);
            reject(new Error(`Timeout esperando: ${JSON.stringify(pattern)}`));
        }, timeoutMs);

        _waiters.push({ pattern, resolve, reject, timeoutId });
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

// Lê até encontrar um delimitador (string), retorna tudo até o delimitador (inclusive)
async function _readUntil(pattern, timeoutMs = 4000) {
    await _waitFor(pattern, timeoutMs);
    return _consumeUntil(pattern);
}

// ===== UTIL: TX =====
async function _sendText(str) {
    if (!_writer) throw new Error("Writer não inicializado");
    await _writer.write(_encoder.encode(str));
}

async function _sendBytes(bytes) {
    if (!_writer) throw new Error("Writer não inicializado");
    await _writer.write(new Uint8Array(bytes));
}

async function _sendCtrl(ch) {
    // Ctrl-A = 0x01, Ctrl-B = 0x02, Ctrl-C = 0x03, Ctrl-D = 0x04
    const map = { "A": 0x01, "B": 0x02, "C": 0x03, "D": 0x04 };
    const code = map[ch.toUpperCase()];
    if (!code) throw new Error(`Ctrl-${ch} inválido`);
    await _sendBytes([code]);
}

// ===== PROTOCOLO: REPL =====
async function _ensureFriendlyRepl() {
    if (!isSerialConnected) return;

    // Tenta sair de raw e voltar para >>>
    try {
        await _sendCtrl("C");
        await _sendCtrl("C");
        await _sendCtrl("B");      // sair do RAW REPL
        await _sendText("\r\n");   // força prompt
        await _waitFor(">>>", 1200);
        _replMode = "friendly";
    } catch (e) {
        // Não foi possível garantir; mantém "unknown"
        _replMode = "unknown";
    }
}

async function _enterRawRepl() {
    if (!isSerialConnected) throw new Error("Sem conexão");

    // Entra em RAW REPL
    await _sendCtrl("C");
    await _sendCtrl("C");
    await _sendCtrl("A");
    // MicroPython tipicamente responde com "raw REPL; CTRL-B to exit"
    await _waitFor("raw REPL", 1500).catch(() => { /* ok: alguns firmwares não imprimem igual */ });
    // Prompt em raw costuma ser ">"
    await _waitFor(">", 1500).catch(() => { /* ok */ });
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

// Executa código usando o protocolo do RAW REPL (sem travar a UI)
async function _execRaw(code) {
    // Protocolo inspirado no "pyboard.py":
    // - entra em raw
    // - envia código + Ctrl-D
    // - lê "OK"
    // - lê stdout até \x04
    // - lê stderr até \x04
    // - lê prompt '>' (ou algo equivalente)
    await _enterRawRepl();

    // Limpa buffer antigo para não confundir leituras
    _rxTextBuffer = "";

    // Envia código
    await _sendText(code);
    if (!code.endsWith("\n")) await _sendText("\n");
    await _sendCtrl("D");

    // 1) ACK do raw
    await _readUntil("OK", 2500).catch(() => { /* alguns firmwares não mandam OK igual */ });

    // 2) stdout até EOT
    const outChunk = await _readUntil("\x04", 8000).catch(() => "");
    const stdout = (outChunk || "").replace(/\x04/g, "");

    // 3) stderr até EOT
    const errChunk = await _readUntil("\x04", 8000).catch(() => "");
    const stderr = (errChunk || "").replace(/\x04/g, "");

    // 4) prompt final (">")
    await _waitFor(">", 2000).catch(() => { /* ok */ });

    return { stdout, stderr };
}

// ===== CONEXÃO SERIAL (WEB SERIAL API) =====
async function connectToSerial() {
    if (!("serial" in navigator)) {
        logToTerminal("❌ Seu navegador não suporta Web Serial. Use Chrome/Edge (desktop).", "sys");
        return false;
    }

    try {
        logToTerminal("Conectando... (selecione a porta serial do MIHU/ESP32)", "sys");

        _port = await navigator.serial.requestPort();

        // Ajuste baudRate se seu firmware usar outro valor
        await _port.open({ baudRate: 115200 });

        _writer = _port.writable.getWriter();
        _reader = _port.readable.getReader();

        updateConnectionUI(true);
        logToTerminal("✅ Conectado via USB Serial", "sys");

        // Loop de leitura
        _startReadLoop();

        // Tenta garantir prompt amigável para o terminal (>>>)
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
            try { await _reader.cancel(); } catch (_) {}
            try { _reader.releaseLock(); } catch (_) {}
            _reader = null;
        }

        if (_writer) {
            try { _writer.releaseLock(); } catch (_) {}
            _writer = null;
        }

        if (_port) {
            try { await _port.close(); } catch (_) {}
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
                const { value, done } = await _reader.read();
                if (done) break;
                if (!value) continue;

                const text = _decoder.decode(value, { stream: true });

                // joga no terminal como output
                _appendDeviceTextToTerminal(text, "out");

                // alimenta buffer para waiters
                _pushRx(text);
            }
        } catch (e) {
            console.warn("Leitura serial encerrada:", e);
        } finally {
            // Se caiu aqui e ainda aparecia conectado, atualiza
            if (isSerialConnected) {
                updateConnectionUI(false);
                logToTerminal("⚠️ Conexão serial encerrada.", "sys");
            }
        }
    })();
}

// ===== EXECUÇÃO / SALVAMENTO =====
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
        logToTerminal("🚀 Executando (RAW REPL)...", "sys");

        // Executa em RAW REPL
        const { stdout, stderr } = await _execRaw(code);

        if (stdout && stdout.trim()) _appendDeviceTextToTerminal(stdout + "\n", "out");
        if (stderr && stderr.trim()) _appendDeviceTextToTerminal(stderr + "\n", "sys");

        logToTerminal("✅ Execução concluída", "sys");

        // Volta para REPL amigável depois de executar
        await _exitRawReplToFriendly();

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro na execução: ${error.message}`, "sys");
        // Tenta voltar pro prompt
        await _exitRawReplToFriendly();
        return false;
    } finally {
        _busy = false;
    }
}

function _toBase64Utf8(str) {
    // converte UTF-8 -> base64 (browser)
    return btoa(unescape(encodeURIComponent(str)));
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

    if (!filename) filename = "programa.py";

    _busy = true;
    try {
        logToTerminal(`💾 Salvando e executando: ${filename}`, "sys");

        const b64 = _toBase64Utf8(code);

        const py = [
            "import ubinascii",
            `data = ubinascii.a2b_base64('${b64}')`,
            `f = open('${filename}', 'wb')`,
            "f.write(data)",
            "f.close()",
            `print('Saved: ${filename}')`,
            `exec(open('${filename}').read(), globals())`,
        ].join("\n");

        const { stdout, stderr } = await _execRaw(py);

        if (stdout && stdout.trim()) _appendDeviceTextToTerminal(stdout + "\n", "out");
        if (stderr && stderr.trim()) _appendDeviceTextToTerminal(stderr + "\n", "sys");

        logToTerminal("✅ Salvo e executado", "sys");
        await _exitRawReplToFriendly();

        return true;
    } catch (error) {
        console.error(error);
        logToTerminal(`❌ Erro ao salvar/executar: ${error.message}`, "sys");
        await _exitRawReplToFriendly();
        return false;
    } finally {
        _busy = false;
    }
}

async function sendStopCommand() {
    if (!isSerialConnected) return;
    try {
        // Ctrl-C interrompe execução
        await _sendCtrl("C");
        await _sendCtrl("C");
        logToTerminal("⏹️ Interrompido (Ctrl-C)", "sys");
        // tenta voltar pro prompt amigável
        await _ensureFriendlyRepl();
    } catch (e) {
        logToTerminal("⚠️ Falha ao interromper.", "sys");
    }
}

// Envia uma linha para o REPL amigável (>>>)
async function _sendReplLine(line) {
    if (!isSerialConnected) return;
    // garante friendly para comandos do terminal
    if (_replMode !== "friendly") await _ensureFriendlyRepl();
    await _sendText(line + "\r\n");
}

// ===== COMANDOS DO TERMINAL =====
async function processTerminalCommand(command) {
    const cmd = command.trim();

    // Comandos locais (prefira ":" para evitar conflito com MicroPython)
    if (cmd === ":help" || cmd === "help") {
        logToTerminal("Comandos locais:", "sys");
        logToTerminal("  help / :help     - Mostra esta ajuda", "sys");
        logToTerminal("  clear            - Limpa o terminal", "sys");
        logToTerminal("  status           - Mostra status da conexão", "sys");
        logToTerminal("  code             - Mostra código atual", "sys");
        logToTerminal("  blocks           - Conta blocos no workspace", "sys");
        logToTerminal("  connect          - Conectar à controladora", "sys");
        logToTerminal("  disconnect       - Desconectar da controladora", "sys");
        logToTerminal("  :raw             - Entrar em RAW REPL (avançado)", "sys");
        logToTerminal("  :friendly        - Voltar para >>> (recomendado)", "sys");
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
        }
        return;
    }

    if (cmd === "blocks") {
        if (workspace) {
            const blocks = workspace.getAllBlocks();
            logToTerminal(`Blocos no workspace: ${blocks.length}`, "sys");
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

    if (cmd === ":raw") {
        if (!isSerialConnected) return;
        await _enterRawRepl().catch(() => {});
        logToTerminal("RAW REPL ativo. Para voltar: :friendly", "sys");
        return;
    }

    if (cmd === ":friendly") {
        if (!isSerialConnected) return;
        await _ensureFriendlyRepl();
        logToTerminal("REPL amigável (>>>) ativo.", "sys");
        return;
    }

    // Default: envia para a controladora (>>>)
    if (isSerialConnected) {
        await _sendReplLine(cmd);
        return;
    }

    logToTerminal(`⚠️ Sem conexão. Use "connect".`, "sys");
}

// ===== INICIALIZAÇÃO =====
function initializeTerminal() {
    // Limpa conteúdo de placeholder do HTML
    clearTerminal();

    logToTerminal("MIHU STUDIO Terminal inicializado", "sys");
    logToTerminal("Digite 'help' para ver comandos locais. Para MicroPython, use comandos normais (ex: help())", "sys");

    // Configurar input do terminal
    const terminalInput = document.getElementById('command');
    const sendBtn = document.getElementById('sendBtn');

    if (terminalInput && sendBtn) {
        // Enviar com Enter
        terminalInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = terminalInput.value.trim();
                if (command) {
                    logToTerminal(`> ${command}`, "in");
                    terminalInput.value = "";
                    await processTerminalCommand(command);
                }
            }
        });

        // Enviar com botão
        sendBtn.addEventListener('click', async () => {
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
