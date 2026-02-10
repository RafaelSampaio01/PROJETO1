// MIHU STUDIO — Editor de Texto (MicroPython via WebSerial)
// Ajustes solicitados:
// - Removeu botões: Reconectar, Baixar, Abrir da Placa, Atualizar Arquivos, Ir
// - Removeu área de LOG
// - Adicionou ações na área de arquivos: Criar pasta, Renomear, Deletar
// - Conectar virou toggle (Conectar/Desconectar)

const $ = (id) => document.getElementById(id);

const ui = {
  btnConnect: $("btnConnect"),
  btnNew: $("btnNew"),
  btnSaveToDevice: $("btnSaveToDevice"),
  btnUpload: $("btnUpload"),
  filePicker: $("filePicker"),

  btnRun: $("btnRun"),
  btnStop: $("btnStop"),
  btnSoftReset: $("btnSoftReset"),

  btnUp: $("btnUp"),
  btnMkdir: $("btnMkdir"),
  btnRename: $("btnRename"),
  btnDeleteSel: $("btnDeleteSel"),

  baud: $("baud"),
  cwd: $("cwd"),
  fileList: $("fileList"),
  tabs: $("tabs"),
  terminal: $("terminal"),
  replInput: $("replInput"),
  btnSend: $("btnSend"),
  prompt: $("prompt"),
  statusText: $("statusText"),
  pill: $("pill"),
  openFileInfo: $("openFileInfo"),
  ctx: $("ctx"),
};

function logLine(msg) {
  // ✅ Sem painel de LOG: vai pro console
  console.log("[MIHU]", msg);
}

function termAppend(text) {
  // Remove ruído do boot / raw REPL
  const filtered = text
    .replaceAll("___BEGIN___", "")
    .replaceAll("___END___", "")
    .replaceAll("___META___", "")
    .replaceAll("raw REPL; CTRL-B to exit", "")
    .replaceAll("raw REPL; CTRL-B to exit\r\n", "")
    .replaceAll(">", "")
    .replace(/\u0000/g, "");

  // Detecta primeira resposta do MicroPython
  if (!mpBannerShown && (
      filtered.includes("MicroPython") ||
      filtered.includes("Type \"help()\"")
  )) {
    showMicroPythonBanner();
    return;
  }

  // Depois do banner, comportamento normal
  if (!filtered.trim()) return;

  ui.terminal.textContent += filtered;
  ui.terminal.scrollTop = ui.terminal.scrollHeight;
}


function setStatus(online, text) {
  ui.pill.textContent = online ? "online" : "offline";
  ui.pill.classList.toggle("online", online);
  ui.pill.classList.toggle("offline", !online);
  ui.statusText.textContent = text;
}

function u8ToB64(u8) {
  let s = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < u8.length; i += CHUNK) {
    s += String.fromCharCode(...u8.subarray(i, i + CHUNK));
  }
  return btoa(s);
}
function b64ToU8(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function concatU8(chunks) {
  let total = 0;
  for (const c of chunks) total += c.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}
function splitString(str, maxLen) {
  const out = [];
  for (let i = 0; i < str.length; i += maxLen) out.push(str.slice(i, i + maxLen));
  return out;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class WebSerialMP {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.rx = "";
    this.reading = false;
  }
  get connected() {
    return !!(this.port && this.writer && this.reader);
  }
  async connect({ baudRate, request = true } = {}) {
    if (!("serial" in navigator)) {
      alert("WebSerial não suportado. Use Chrome/Edge e abra em https ou localhost.");
      return;
    }
    if (request) {
      this.port = await navigator.serial.requestPort();
    } else {
      const ports = await navigator.serial.getPorts();
      if (!ports.length) throw new Error("Nenhuma porta previamente autorizada.");
      this.port = ports[0];
    }
    await this.port.open({ baudRate });
    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();
    this.rx = "";
    this.reading = true;
    this._readLoop();
  }
  async disconnect() {
    this.reading = false;
    try {
      if (this.reader) { await this.reader.cancel(); this.reader.releaseLock(); }
      if (this.writer) { this.writer.releaseLock(); }
      if (this.port) { await this.port.close(); }
    } catch {}
    this.reader = this.writer = this.port = null;
    this.rx = "";
  }
  async _readLoop() {
    while (this.port && this.reader && this.reading) {
      const { value, done } = await this.reader.read();
      if (done) break;
      if (value) {
        const text = new TextDecoder().decode(value);
        this.rx += text;
        termAppend(text);
      }
    }
  }
  async writeText(s) {
    if (!this.writer) throw new Error("Sem writer");
    await this.writer.write(new TextEncoder().encode(s));
  }
  async writeBytes(bytes) {
    if (!this.writer) throw new Error("Sem writer");
    await this.writer.write(new Uint8Array(bytes));
  }
  async ctrlC() { await this.writeBytes([0x03]); }
  async ctrlD() { await this.writeBytes([0x04]); }
  async ctrlA() { await this.writeBytes([0x01]); }
  async ctrlB() { await this.writeBytes([0x02]); }
  async ensureFriendly() { await this.ctrlB(); await sleep(30); }
  async enterRaw() { await this.writeBytes([0x03,0x03]); await sleep(80); await this.ctrlA(); await sleep(80); }
  async exitRaw() { await this.ctrlB(); await sleep(80); }
  waitFor(pattern, timeoutMs = 6000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const t = setInterval(() => {
        if (this.rx.includes(pattern)) { clearInterval(t); resolve(true); }
        else if (Date.now() - start > timeoutMs) { clearInterval(t); reject(new Error("Timeout esperando: " + pattern)); }
      }, 30);
    });
  }
  async rawExec(code, { endMarker = "___END___", timeoutMs = 12000 } = {}) {
    this.rx = "";
    await this.enterRaw();
    await this.writeText(code);
    await this.writeBytes([0x04]);
    await this.waitFor(endMarker, timeoutMs);
    const out = this.rx;
    await this.exitRaw();
    return out;
  }
}
const dev = new WebSerialMP();
let mpBannerShown = false;



// Tabs / Editor
let cm = null;
let tabs = [];
let activeTabId = null;
let tabSeq = 1;


function showMicroPythonBanner() {
  if (mpBannerShown) return;

  ui.terminal.textContent = ""; // limpa tudo

  const banner = document.createElement("div");
  banner.className = "mp-banner";
  banner.textContent =
`MicroPython v1.25.0 on 2025-07-28; Generic Libs with ESP32-S3H4
Type "help()" for more information.`;

  ui.terminal.appendChild(banner);
  mpBannerShown = true;
}


function initEditor() {
  cm = CodeMirror.fromTextArea($("code"), {
    mode: "python",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    theme: "material-darker",
    autofocus: true,
  });
  cm.on("change", () => {
    const t = getActiveTab();
    if (!t) return;
    t.content = cm.getValue();
    if (!t.dirty) { t.dirty = true; renderTabs(); }
  });
}
function newTab(name = `script${tabSeq++}.py`, content = "# Escreva seu código aqui\n") {
  const id = crypto.randomUUID();
  tabs.push({ id, name, content, dirty: false, devicePath: null });
  setActiveTab(id);
}
function closeTab(id) {
  const idx = tabs.findIndex(t => t.id === id);
  if (idx === -1) return;
  const t = tabs[idx];
  if (t.dirty && !confirm(`"${t.name}" tem alterações não salvas. Fechar mesmo assim?`)) return;
  tabs.splice(idx, 1);
  if (activeTabId === id) {
    activeTabId = tabs.length ? tabs[Math.max(0, idx - 1)].id : null;
    if (activeTabId) cm.setValue(getActiveTab().content);
  }
  renderTabs();
}
function setActiveTab(id) {
  activeTabId = id;
  const t = getActiveTab();
  renderTabs();
  cm.setValue(t.content);
  cm.focus();
  updateOpenFileInfo();
}
function getActiveTab() {
  return tabs.find(t => t.id === activeTabId) || null;
}
function renderTabs() {
  ui.tabs.innerHTML = "";
  for (const t of tabs) {
    const el = document.createElement("div");
    el.className = "tab" + (t.id === activeTabId ? " active" : "");
    el.title = t.devicePath ? t.devicePath : "Sem caminho na placa";
    const label = document.createElement("div");
    label.textContent = (t.dirty ? "● " : "") + t.name;
    el.appendChild(label);
    const x = document.createElement("div");
    x.className = "x"; x.textContent = "×";
    x.addEventListener("click", (ev) => { ev.stopPropagation(); closeTab(t.id); });
    el.appendChild(x);
    el.addEventListener("click", () => setActiveTab(t.id));
    ui.tabs.appendChild(el);
  }
}
function updateOpenFileInfo() {
  const t = getActiveTab();
  ui.openFileInfo.textContent = t
    ? ("Arquivo na placa: " + (t.devicePath || "— (use Salvar na Placa)"))
    : "—";
}

// Device FS helpers
function joinPath(base, name) {
  if (!base || base === "/") return "/" + name;
  return base.replace(/\/+$/,"") + "/" + name;
}
function parentPath(p) {
  if (!p || p === "/") return "/";
  const s = p.replace(/\/+$/,"");
  const i = s.lastIndexOf("/");
  return i <= 0 ? "/" : s.slice(0, i);
}
function extractBetween(text, a, b) {
  const i = text.indexOf(a);
  const j = text.indexOf(b, i + a.length);
  if (i === -1 || j === -1) return null;
  return text.substring(i + a.length, j);
}

let cwd = "/";
let selectedItem = null;

async function deviceLs(path) {
  const py = `
import uos, ujson
P = ${JSON.stringify(path)}
def _join(base, name):
    if base in ("", "/"):
        return "/" + name
    return base.rstrip("/") + "/" + name
def _isdir(mode):
    try:
        return (mode & 0x4000) != 0
    except:
        return False
out = []
try:
    for n in uos.listdir(P):
        p = _join(P, n)
        t = "file"
        sz = None
        try:
            st = uos.stat(p)
            if _isdir(st[0]): t = "dir"
            sz = st[6]
        except:
            pass
        out.append({"name": n, "path": p, "type": t, "size": sz})
except Exception as e:
    out = [{"name":"<erro>", "path": P, "type":"error", "size": None, "msg": str(e)}]
print("___BEGIN___")
print(ujson.dumps(out))
print("___END___")
`;
  const out = await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 12000 });
  const jsonText = extractBetween(out, "___BEGIN___", "___END___");
  if (!jsonText) throw new Error("Não consegui ler listagem.");
  const items = JSON.parse(jsonText.trim());
  items.sort((a,b) => (a.type === b.type ? a.name.localeCompare(b.name) : (a.type === "dir" ? -1 : 1)));
  return items;
}

async function deviceCat(path) {
  const py = `
import ubinascii, ujson
P = ${JSON.stringify(path)}
print("___BEGIN___")
try:
    with open(P, "rb") as f:
        while True:
            b = f.read(512)
            if not b: break
            print(ubinascii.b2a_base64(b).decode().strip())
    print("___META___" + ujson.dumps({"ok": True, "path": P}))
except Exception as e:
    print("___ERROR___" + str(e))
print("___END___")
`;
  const out = await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 20000 });
  const body = extractBetween(out, "___BEGIN___", "___END___");
  if (!body) throw new Error("Falha ao ler arquivo.");
  const lines = body.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const err = lines.find(l => l.startsWith("___ERROR___"));
  if (err) throw new Error(err.replace("___ERROR___", ""));
  const b64Lines = lines.filter(l => !l.startsWith("___META___"));
  const chunks = b64Lines.map(b64ToU8);
  return concatU8(chunks);
}

async function deviceWriteText(path, text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 60000) throw new Error("Arquivo grande demais (limite ~60KB).");
  const b64 = u8ToB64(bytes);
  const parts = splitString(b64, 700);
  const arrLiteral = "[" + parts.map(p => JSON.stringify(p)).join(",") + "]";
  const py = `
import ubinascii
P = ${JSON.stringify(path)}
DATA = ${arrLiteral}
print("___BEGIN___")
try:
    with open(P, "wb") as f:
        for s in DATA:
            f.write(ubinascii.a2b_base64(s))
    print("OK")
except Exception as e:
    print("ERR:" + str(e))
print("___END___")
`;
  const out = await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 20000 });
  const body = (extractBetween(out, "___BEGIN___", "___END___") || "").trim();
  if (body.startsWith("ERR:")) throw new Error(body);
}

async function deviceDeleteFile(path) {
  const py = `
import uos
P = ${JSON.stringify(path)}
print("___BEGIN___")
try:
    uos.remove(P); print("OK")
except Exception as e:
    print("ERR:" + str(e))
print("___END___")
`;
  const out = await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 12000 });
  const body = (extractBetween(out, "___BEGIN___", "___END___") || "").trim();
  if (body.startsWith("ERR:")) throw new Error(body);
}

async function deviceDeleteDir(path) {
  const py = `
import uos
P = ${JSON.stringify(path)}
print("___BEGIN___")
try:
    uos.rmdir(P); print("OK")
except Exception as e:
    print("ERR:" + str(e))
print("___END___")
`;
  const out = await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 12000 });
  const body = (extractBetween(out, "___BEGIN___", "___END___") || "").trim();
  if (body.startsWith("ERR:")) throw new Error(body);
}

async function deviceMkdir(path) {
  const py = `
import uos
P = ${JSON.stringify(path)}
print("___BEGIN___")
try:
    uos.mkdir(P); print("OK")
except Exception as e:
    print("ERR:" + str(e))
print("___END___")
`;
  const out = await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 12000 });
  const body = (extractBetween(out, "___BEGIN___", "___END___") || "").trim();
  if (body.startsWith("ERR:")) throw new Error(body);
}

async function deviceRename(oldPath, newPath) {
  const py = `
import uos
A = ${JSON.stringify(oldPath)}
B = ${JSON.stringify(newPath)}
print("___BEGIN___")
try:
    uos.rename(A, B); print("OK")
except Exception as e:
    print("ERR:" + str(e))
print("___END___")
`;
  const out = await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 12000 });
  const body = (extractBetween(out, "___BEGIN___", "___END___") || "").trim();
  if (body.startsWith("ERR:")) throw new Error(body);
}

// File list UI
async function refreshFiles(path = cwd) {
  ui.fileList.innerHTML = `<div class="hint">Carregando...</div>`;
  try {
    const items = await deviceLs(path);
    cwd = path;
    ui.cwd.textContent = cwd;
    renderFileList(items);
  } catch (e) {
    ui.fileList.innerHTML = `<div class="hint">Erro: ${String(e.message || e)}</div>`;
    logLine("Erro listar: " + (e.message || e));
  }
}

function updateFileActionButtons() {
  const hasSel = !!selectedItem && (selectedItem.type === "file" || selectedItem.type === "dir");
  ui.btnRename.disabled = !dev.connected || !hasSel;
  ui.btnDeleteSel.disabled = !dev.connected || !hasSel;
}

function renderFileList(items) {
  ui.fileList.innerHTML = "";
  selectedItem = null;
  updateFileActionButtons();

  if (!items.length) { ui.fileList.innerHTML = `<div class="hint">(pasta vazia)</div>`; return; }

  for (const it of items) {
    const row = document.createElement("div");
    row.className = "fileitem";
    row.dataset.path = it.path;
    row.dataset.type = it.type;
    row.dataset.name = it.name;

    const icon = document.createElement("div");
    icon.className = "fileicon";
    icon.textContent = it.type === "dir" ? "📁" : (it.type === "file" ? "📄" : "⚠️");

    const name = document.createElement("div");
    name.textContent = it.name + (it.type === "dir" ? "/" : "");

    const meta = document.createElement("div");
    meta.className = "filemeta mono";
    meta.textContent = it.type === "file" && typeof it.size === "number" ? `${it.size}b` : "";

    row.appendChild(icon); row.appendChild(name); row.appendChild(meta);

    row.addEventListener("click", () => selectItem(it, row));
    row.addEventListener("dblclick", async () => {
      if (it.type === "dir") await refreshFiles(it.path);
      else if (it.type === "file") await openFromDevice(it.path);
    });
    row.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      selectItem(it, row);
      showCtx(ev.clientX, ev.clientY);
    });

    ui.fileList.appendChild(row);
  }
}

function selectItem(it, rowEl) {
  selectedItem = it;
  for (const el of ui.fileList.querySelectorAll(".fileitem")) el.classList.remove("active");
  if (rowEl) rowEl.classList.add("active");
  updateFileActionButtons();
}

// Actions
async function openFromDevice(path) {
  try {
    const bytes = await deviceCat(path);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const name = path.split("/").pop() || "arquivo.py";
    const id = crypto.randomUUID();
    tabs.push({ id, name, content: text, dirty: false, devicePath: path });
    setActiveTab(id);
    renderTabs();
    updateOpenFileInfo();
  } catch (e) {
    alert("Erro ao abrir: " + (e.message || e));
  }
}

async function saveToDevice() {
  const t = getActiveTab();
  if (!t) return;
  let path = t.devicePath;
  if (!path) {
    const suggested = joinPath(cwd, t.name);
    path = prompt("Salvar em qual caminho na placa?", suggested);
    if (!path) return;
  }
  try {
    await deviceWriteText(path, cm.getValue());
    t.devicePath = path;
    t.dirty = false;
    t.name = path.split("/").pop() || t.name;
    renderTabs(); updateOpenFileInfo();
    await refreshFiles(cwd);
  } catch (e) {
    alert("Erro ao salvar: " + (e.message || e));
  }
}

function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text.split(/\r?\n/).map(l => pad + l).join("\n");
}

async function runEditor() {
  const code = cm.getValue();

  const py = `
try:
${indent(code, 4)}
except Exception as e:
    import sys
    sys.print_exception(e)

print("___END___")
`;

  ui.btnRun.disabled = true;
  try {
    await dev.rawExec(py, {
      endMarker: "___END___",
      timeoutMs: 60000
    });
  } catch (e) {
    alert("Erro execução: " + (e.message || e));
  } finally {
    ui.btnRun.disabled = false;
  }
}


async function stopProgram() {
  try { await dev.ctrlC(); await dev.ctrlC(); }
  catch (e) { alert("Erro stop: " + (e.message || e)); }
}

async function softReset() {
  try { await dev.ensureFriendly(); await dev.ctrlD(); }
  catch (e) { alert("Erro reset: " + (e.message || e)); }
}

async function sendReplLine() {
  const line = ui.replInput.value;
  if (!line.trim()) return;
  ui.replInput.value = "";
  try {
    await dev.ensureFriendly();
    termAppend("\n" + line + "\n");
    await dev.writeText(line + "\r\n");
  } catch (e) {
    alert("Erro enviar REPL: " + (e.message || e));
  }
}

// Sidebar file actions
async function mkdirAction() {
  const name = prompt("Nome da nova pasta:", "nova_pasta");
  if (!name) return;
  const path = joinPath(cwd, name);
  try {
    await deviceMkdir(path);
    await refreshFiles(cwd);
  } catch (e) {
    alert("Erro criar pasta: " + (e.message || e));
  }
}

async function renameAction() {
  if (!selectedItem) return;
  const newName = prompt("Novo nome:", selectedItem.name);
  if (!newName || newName === selectedItem.name) return;
  const newPath = joinPath(cwd, newName);
  try {
    await deviceRename(selectedItem.path, newPath);

    // Se algum tab estiver apontando para o arquivo renomeado, atualiza o path
    for (const t of tabs) {
      if (t.devicePath === selectedItem.path) {
        t.devicePath = newPath;
        t.name = newName;
        t.dirty = true; // marca alteração por segurança visual
      }
    }
    renderTabs();
    updateOpenFileInfo();

    await refreshFiles(cwd);
  } catch (e) {
    alert("Erro renomear: " + (e.message || e));
  }
}

async function deleteAction() {
  if (!selectedItem) return;
  const msg = selectedItem.type === "dir"
    ? `Deletar a pasta ${selectedItem.path}? (precisa estar vazia)`
    : `Deletar o arquivo ${selectedItem.path}?`;
  if (!confirm(msg)) return;

  try {
    if (selectedItem.type === "dir") await deviceDeleteDir(selectedItem.path);
    else await deviceDeleteFile(selectedItem.path);

    // Se algum tab estava nesse arquivo, zera o devicePath
    for (const t of tabs) {
      if (t.devicePath === selectedItem.path) {
        t.devicePath = null;
        t.dirty = true;
      }
    }
    renderTabs();
    updateOpenFileInfo();

    await refreshFiles(cwd);
  } catch (e) {
    alert("Erro deletar: " + (e.message || e));
  }
}

// Context menu
function showCtx(x, y) {
  ui.ctx.style.left = x + "px";
  ui.ctx.style.top = y + "px";
  ui.ctx.classList.remove("hidden");
}
function hideCtx() { ui.ctx.classList.add("hidden"); }
window.addEventListener("click", () => hideCtx());
window.addEventListener("keydown", (e) => { if (e.key === "Escape") hideCtx(); });

ui.ctx.addEventListener("click", async (ev) => {
  const btn = ev.target.closest("button");
  if (!btn || !selectedItem) return;
  const act = btn.dataset.act;
  hideCtx();
  if (act === "open") {
    if (selectedItem.type === "dir") await refreshFiles(selectedItem.path);
    else await openFromDevice(selectedItem.path);
  } else if (act === "cat") {
    if (selectedItem.type !== "file") return;
    try {
      const bytes = await deviceCat(selectedItem.path);
      const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      alert(text.length > 12000 ? (text.slice(0, 12000) + "\n\n... (cortado)") : text);
    } catch (e) { alert("Erro: " + (e.message || e)); }
  } else if (act === "rename") {
    await renameAction();
  } else if (act === "delete") {
    await deleteAction();
  }
});

// Upload local (importar arquivo pro editor)
function uploadLocalFile() { ui.filePicker.click(); }
ui.filePicker.addEventListener("change", async () => {
  const file = ui.filePicker.files?.[0];
  ui.filePicker.value = "";
  if (!file) return;
  const text = await file.text();
  const id = crypto.randomUUID();
  tabs.push({ id, name: file.name, content: text, dirty: true, devicePath: null });
  setActiveTab(id); renderTabs();
});

// UI wiring
function setConnectedUI(connected) {
  ui.btnSaveToDevice.disabled = !connected;
  ui.btnRun.disabled = !connected;
  ui.btnStop.disabled = !connected;
  ui.btnSoftReset.disabled = !connected;

  ui.btnUp.disabled = !connected;
  ui.btnMkdir.disabled = !connected;
  ui.btnUpload.disabled = !connected;

  ui.replInput.disabled = !connected;
  ui.btnSend.disabled = !connected;

  if (!connected) {
    selectedItem = null;
    updateFileActionButtons();
  } else {
    updateFileActionButtons();
  }
}

function setConnectButtonState(connected) {
  ui.btnConnect.textContent = connected ? "Desconectar" : "Conectar";
  ui.btnConnect.classList.toggle("danger", connected);
  ui.btnConnect.classList.toggle("primary", !connected);
}

let connectBusy = false;

ui.btnConnect.addEventListener("click", async () => {
  if (connectBusy) return;
  connectBusy = true;
  ui.btnConnect.disabled = true;
  try {
    if (dev.connected) {
      // ✅ toggle: desconectar
      await dev.disconnect();
      mpBannerShown = false;
      ui.terminal.textContent = "";

      setStatus(false, "Desconectado");
      setConnectedUI(false);
      setConnectButtonState(false);
      ui.fileList.innerHTML = `<div class="hint">Conecte para listar os arquivos.</div>`;
      return;
    }

    // ✅ toggle: conectar
    const baudRate = Number(ui.baud.value || "115200");
    setStatus(false, "Conectando...");
    await dev.connect({ baudRate, request: true });
    setStatus(true, "Conectado (porta selecionada no navegador)");
    setConnectedUI(true);
    setConnectButtonState(true);

    ui.terminal.textContent = "";
    await dev.ensureFriendly();
    await refreshFiles("/");
  } catch (e) {
    setStatus(false, "Falha ao conectar");
    setConnectedUI(false);
    setConnectButtonState(false);
    alert("Erro ao conectar: " + (e.message || e));
  } finally {
    ui.btnConnect.disabled = false;
    connectBusy = false;
  }
});

ui.btnUp.addEventListener("click", () => refreshFiles(parentPath(cwd)));
ui.btnMkdir.addEventListener("click", mkdirAction);
ui.btnRename.addEventListener("click", renameAction);
ui.btnDeleteSel.addEventListener("click", deleteAction);

ui.btnNew.addEventListener("click", () => newTab());
ui.btnSaveToDevice.addEventListener("click", saveToDevice);
ui.btnUpload.addEventListener("click", uploadLocalFile);

ui.btnRun.addEventListener("click", runEditor);
ui.btnStop.addEventListener("click", stopProgram);
ui.btnSoftReset.addEventListener("click", softReset);

ui.btnSend.addEventListener("click", sendReplLine);
ui.replInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); sendReplLine(); }
});

window.addEventListener("keydown", async (e) => {
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
  if (ctrlOrCmd && e.key === "Enter") { e.preventDefault(); if (!ui.btnRun.disabled) runEditor(); }
  if (ctrlOrCmd && (e.key === "s" || e.key === "S")) { e.preventDefault(); if (!ui.btnSaveToDevice.disabled) saveToDevice(); }
  if (ctrlOrCmd && (e.key === "c" || e.key === "C")) {
    const ae = document.activeElement;
    if (ae === ui.replInput || ae === document.body) { if (!ui.btnStop.disabled) stopProgram(); }
  }
});

// Boot
initEditor();
newTab("main.py", `# Exemplo\nprint("Olá do MIHU STUDIO!")\n`);
renderTabs();
setConnectedUI(false);
setConnectButtonState(false);
setStatus(false, "Nenhuma porta conectada");
ui.fileList.addEventListener("scroll", hideCtx);
