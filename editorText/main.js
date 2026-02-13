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

  // REPL
  app: $("app"),
  repl: $("repl"),
  replResizer: $("replResizer"),
  btnReplMode: $("btnReplMode"),
  btnReplClear: $("btnReplClear"),

  // Exemplos (PC)
  btnExamplesFab: $("btnExamplesFab"),
  examplesDrawer: $("examplesDrawer"),
  btnExCloseDrawer: $("btnExCloseDrawer"),
  btnPickExamples: $("btnPickExamples"),
  btnExRefresh: $("btnExRefresh"),
  exRootPath: $("exRootPath"),
  exTree: $("exTree"),

  // Modal exemplo
  exModal: $("exModal"),
  exModalTitle: $("exModalTitle"),
  exModalPath: $("exModalPath"),
  exModalCode: $("exModalCode"),
  btnExClose: $("btnExClose"),
  btnExCopy: $("btnExCopy"),
  btnExRun: $("btnExRun"),

  // Tutorial
  btnTour: $("btnTour"),
  tour: $("tour"),
  tourBackdrop: $("tourBackdrop"),
  tourHL: $("tourHL"),
  tourCard: $("tourCard"),
  tourTitle: $("tourTitle"),
  tourBody: $("tourBody"),
  tourProg: $("tourProg"),
  btnTourPrev: $("btnTourPrev"),
  btnTourNext: $("btnTourNext"),
  btnTourEnd: $("btnTourEnd"),
  btnTourEndX: $("btnTourEndX"),
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function logLine(msg) { console.log("[MIHU]", msg); }

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
function extractBetween(text, a, b) {
  const i = text.indexOf(a);
  const j = text.indexOf(b, i + a.length);
  if (i === -1 || j === -1) return null;
  return text.substring(i + a.length, j);
}
function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text.split(/\r?\n/).map(l => pad + l).join("\n");
}

// ================================
// REPL: altura + modo AUTO/SHOW/HIDE
// ================================
const REPL_HEIGHT_KEY = "mihu_repl_height";
const REPL_MODE_KEY = "mihu_repl_mode"; // auto|show|hide
let replMode = (localStorage.getItem(REPL_MODE_KEY) || "auto").toLowerCase();
let replLastExpanded = Number(localStorage.getItem(REPL_HEIGHT_KEY) || 260);
let replIdleTimer = null;

function setAppReplHeight(px) {
  const v = Math.max(120, Math.min(px, Math.round(window.innerHeight * 0.7)));
  ui.app.style.setProperty("--replH", v + "px");
  localStorage.setItem(REPL_HEIGHT_KEY, String(v));
  replLastExpanded = v;
}
function setReplCollapsed(collapsed) {
  ui.repl.classList.toggle("collapsed", !!collapsed);
}
function setReplMode(next) {
  replMode = next;
  localStorage.setItem(REPL_MODE_KEY, replMode);
  ui.btnReplMode.textContent = replMode.toUpperCase();

  if (replMode === "hide") {
    ui.app.style.setProperty("--replH", "56px");
    setReplCollapsed(true);
  } else if (replMode === "show") {
    setAppReplHeight(replLastExpanded || 260);
    setReplCollapsed(false);
  } else {
    ui.app.style.setProperty("--replH", "56px");
    setReplCollapsed(true);
  }
}
function replOnSerialActivity() {
  if (replMode !== "auto") return;

  setAppReplHeight(replLastExpanded || 260);
  setReplCollapsed(false);

  if (replIdleTimer) clearTimeout(replIdleTimer);
  replIdleTimer = setTimeout(() => {
    const focused = (document.activeElement === ui.replInput);
    if (!focused && replMode === "auto") {
      ui.app.style.setProperty("--replH", "56px");
      setReplCollapsed(true);
    }
  }, 6500);
}

(function initReplResizer(){
  let dragging = false;
  let startY = 0;
  let startH = 0;

  ui.replResizer.addEventListener("mousedown", (ev) => {
    dragging = true;
    startY = ev.clientY;
    startH = parseInt(getComputedStyle(ui.app).getPropertyValue("--replH")) || replLastExpanded || 260;
    document.body.style.userSelect = "none";
  });

  window.addEventListener("mousemove", (ev) => {
    if (!dragging) return;
    const dy = startY - ev.clientY;
    const newH = startH + dy;

    if (replMode !== "show") setReplMode("show");
    setAppReplHeight(newH);
    setReplCollapsed(false);
  });

  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = "";
  });
})();

ui.btnReplMode.addEventListener("click", () => {
  const order = ["auto", "show", "hide"];
  const i = order.indexOf(replMode);
  setReplMode(order[(i + 1) % order.length]);
});

ui.btnReplClear.addEventListener("click", () => {
  ui.terminal.textContent = "";
  mpBannerShown = false;
});

// ================================
// Terminal
// ================================
let mpBannerShown = false;

function showMicroPythonBanner() {
  if (mpBannerShown) return;
  ui.terminal.textContent = "";
  const banner = document.createElement("div");
  banner.className = "mp-banner";
  banner.textContent =
`MicroPython v1.25.0 on 2025-07-28; Generic Libs with ESP32-S3H4
Type "help()" for more information.`;
  ui.terminal.appendChild(banner);
  mpBannerShown = true;
}

function termAppend(text) {
  const filtered = text
    .replaceAll("___BEGIN___", "")
    .replaceAll("___END___", "")
    .replaceAll("___META___", "")
    .replaceAll("raw REPL; CTRL-B to exit\r\n", "")
    .replaceAll("raw REPL; CTRL-B to exit", "")
    .replace(/\u0000/g, "");

  if (!mpBannerShown && (
    filtered.includes("MicroPython") ||
    filtered.includes("Type \"help()\"")
  )) {
    showMicroPythonBanner();
    return;
  }

  if (!filtered) return;
  if (filtered.trim()) replOnSerialActivity();

  ui.terminal.textContent += filtered;
  ui.terminal.scrollTop = ui.terminal.scrollHeight;
}

// ================================
// WebSerial MicroPython
// ================================
class WebSerialMP {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.rx = "";
    this.reading = false;
    this.abortRequested = false;
    this.inRaw = false;
  }
  get connected() { return !!(this.port && this.writer && this.reader); }

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
    this.abortRequested = false;
    this.inRaw = false;
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

  async ensureFriendly() { await this.ctrlB(); await sleep(40); }
  async enterRaw() {
    await this.writeBytes([0x03,0x03]); await sleep(80);
    await this.ctrlA(); await sleep(80);
    this.inRaw = true;
  }
  async exitRaw() { await this.ctrlB(); await sleep(80); this.inRaw = false; }

  requestAbort() { this.abortRequested = true; }

  waitFor(pattern, timeoutMs = 6000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const t = setInterval(() => {
        if (this.abortRequested) {
          clearInterval(t);
          const err = new Error("AbortError");
          err.name = "AbortError";
          reject(err);
          return;
        }
        if (this.rx.includes(pattern)) { clearInterval(t); resolve(true); }
        else if (Date.now() - start > timeoutMs) { clearInterval(t); reject(new Error("Timeout esperando: " + pattern)); }
      }, 30);
    });
  }

  async rawExec(code, { endMarker = "___END___", timeoutMs = 12000 } = {}) {
    this.rx = "";
    this.abortRequested = false;

    await this.enterRaw();
    try {
      await this.writeText(code);
      await this.writeBytes([0x04]);
      await this.waitFor(endMarker, timeoutMs);
      return this.rx;
    } finally {
      try { await this.exitRaw(); } catch {}
    }
  }
}

const dev = new WebSerialMP();

// ================================
// Editor / Tabs
// ================================
let cm = null;
let tabs = [];
let activeTabId = null;
let tabSeq = 1;

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
function getActiveTab() { return tabs.find(t => t.id === activeTabId) || null; }

function setActiveTab(id) {
  activeTabId = id;
  const t = getActiveTab();
  renderTabs();
  cm.setValue(t.content);
  cm.focus();
  updateOpenFileInfo();
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

// ================================
// FS helpers (placa)
// ================================
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

// ================================
// File list UI (placa)
// ================================
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

    const icon = document.createElement("div");
    icon.className = "fileicon";
    icon.textContent = it.type === "dir" ? "📁" : (it.type === "file" ? "📄" : "⚠️");

    const name = document.createElement("div");
    name.textContent = it.name + (it.type === "dir" ? "/" : "");

    const meta = document.createElement("div");
    meta.className = "filemeta mono";
    meta.textContent = it.type === "file" && typeof it.size === "number" ? `${it.size}b` : "";

    row.appendChild(icon); row.appendChild(name); row.appendChild(meta);

    row.addEventListener("click", () => {
      selectedItem = it;
      for (const el of ui.fileList.querySelectorAll(".fileitem")) el.classList.remove("active");
      row.classList.add("active");
      updateFileActionButtons();
    });

    row.addEventListener("dblclick", async () => {
      if (it.type === "dir") await refreshFiles(it.path);
      else if (it.type === "file") await openFromDevice(it.path);
    });

    row.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      selectedItem = it;
      for (const el of ui.fileList.querySelectorAll(".fileitem")) el.classList.remove("active");
      row.classList.add("active");
      updateFileActionButtons();
      showCtx(ev.clientX, ev.clientY);
    });

    ui.fileList.appendChild(row);
  }
}

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

async function mkdirAction() {
  const name = prompt("Nome da nova pasta:", "nova_pasta");
  if (!name) return;
  const path = joinPath(cwd, name);
  try { await deviceMkdir(path); await refreshFiles(cwd); }
  catch (e) { alert("Erro criar pasta: " + (e.message || e)); }
}

async function renameAction() {
  if (!selectedItem) return;
  const newName = prompt("Novo nome:", selectedItem.name);
  if (!newName || newName === selectedItem.name) return;
  const newPath = joinPath(cwd, newName);
  try {
    await deviceRename(selectedItem.path, newPath);

    for (const t of tabs) {
      if (t.devicePath === selectedItem.path) {
        t.devicePath = newPath;
        t.name = newName;
        t.dirty = true;
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

// Upload local (PC -> editor)
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

// ================================
// RUN / STOP / RESET
// ================================
let runInProgress = false;

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

  if (runInProgress) return;

  ui.btnRun.disabled = true;
  runInProgress = true;

  try {
    await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 60000 });
  } catch (e) {
    if (e?.name === "AbortError") return;
    alert("Erro execução: " + (e.message || e));
  } finally {
    runInProgress = false;
    ui.btnRun.disabled = !dev.connected;
  }
}

// STOP forte
async function stopProgram() {
  try {
    dev.requestAbort();
    await dev.ctrlC(); await sleep(30);
    await dev.ctrlC(); await sleep(30);
    try { await dev.exitRaw(); } catch {}
    await dev.ensureFriendly();
  } catch (e) {
    alert("Erro stop: " + (e.message || e));
  }
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
    await dev.writeText(line + "\r\n");
  } catch (e) {
    alert("Erro enviar REPL: " + (e.message || e));
  }
}

// ================================
// Exemplos (PC): pasta + subpastas + read-only
// ================================
const exState = {
  root: { name: "Exemplos", type: "dir", loaded: false, expanded: true, children: [], handle: null, key: "root", label: "" },
  selectedKey: null,
};

function exDrawerOpen() { return !ui.examplesDrawer.classList.contains("hidden"); }
function openExamplesDrawer() { ui.examplesDrawer.classList.remove("hidden"); }
function closeExamplesDrawer() { ui.examplesDrawer.classList.add("hidden"); }

ui.btnExamplesFab.addEventListener("click", () => {
  if (exDrawerOpen()) closeExamplesDrawer();
  else openExamplesDrawer();
});
ui.btnExCloseDrawer.addEventListener("click", closeExamplesDrawer);

window.addEventListener("mousedown", (ev) => {
  if (!exDrawerOpen()) return;
  const t = ev.target;
  if (ui.examplesDrawer.contains(t)) return;
  if (ui.btnExamplesFab.contains(t)) return;
  closeExamplesDrawer();
});

// IndexedDB para guardar handle
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("mihu_examples_db", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(value, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readonly");
    const req = tx.objectStore("kv").get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function ensureReadPermission(dirHandle) {
  if (!dirHandle) return false;
  if (dirHandle.queryPermission) {
    const q = await dirHandle.queryPermission({ mode: "read" });
    if (q === "granted") return true;
  }
  if (dirHandle.requestPermission) {
    const r = await dirHandle.requestPermission({ mode: "read" });
    return r === "granted";
  }
  return true;
}

async function loadDirChildren(node) {
  const dir = node.handle;
  if (!dir) throw new Error("Sem pasta selecionada.");

  const kids = [];
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind === "directory") {
      kids.push({ name, type: "dir", handle, loaded: false, expanded: false, children: [], key: `${node.key}/${name}` });
    } else if (handle.kind === "file") {
      if (!name.toLowerCase().endsWith(".py")) continue;
      kids.push({ name, type: "file", handle, key: `${node.key}/${name}` });
    }
  }

  kids.sort((a,b) => (a.type === b.type ? a.name.localeCompare(b.name) : (a.type === "dir" ? -1 : 1)));
  node.children = kids;
  node.loaded = true;
}

function setTreeSelected(key) {
  exState.selectedKey = key;
  for (const el of ui.exTree.querySelectorAll(".tree-item")) {
    el.classList.toggle("active", el.dataset.key === key);
  }
}

function renderExTree() {
  ui.exTree.innerHTML = "";

  if (!("showDirectoryPicker" in window)) {
    ui.exTree.innerHTML = `<div class="hint">Seu navegador não suporta acesso a pastas do PC. Use Chrome/Edge.</div>`;
    return;
  }
  if (!exState.root.handle) {
    ui.exTree.innerHTML = `<div class="hint">Clique em <span class="mono">Escolher pasta</span> para selecionar a pasta de exemplos no PC.</div>`;
    return;
  }
  if (!exState.root.loaded) {
    ui.exTree.innerHTML = `<div class="hint">Clique em <span class="mono">Atualizar</span> para listar os exemplos.</div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  const renderNode = (node, depth) => {
    const row = document.createElement("div");
    row.className = "tree-item" + (exState.selectedKey === node.key ? " active" : "");
    row.dataset.key = node.key;

    const pad = document.createElement("div");
    pad.className = "tree-pad";
    pad.style.width = `${depth * 14}px`;

    const twisty = document.createElement("span");
    twisty.className = "tree-twisty";
    twisty.textContent = node.type === "dir" ? (node.expanded ? "▾" : "▸") : "";

    const ico = document.createElement("div");
    ico.className = "tree-ico";
    ico.textContent = node.type === "dir" ? "📁" : "📄";

    const name = document.createElement("div");
    name.className = "tree-name";
    name.textContent = node.name;

    row.appendChild(pad);
    row.appendChild(twisty);
    row.appendChild(ico);
    row.appendChild(name);

    row.addEventListener("click", async () => {
      setTreeSelected(node.key);

      if (node.type === "dir") {
        node.expanded = !node.expanded;
        if (node.expanded && !node.loaded) {
          ui.exTree.style.opacity = "0.7";
          try { await loadDirChildren(node); }
          finally { ui.exTree.style.opacity = ""; }
        }
        renderExTree();
        setTreeSelected(node.key);
      } else {
        await openExampleReadOnlyFromPC(node.handle, node.name, node.key);
      }
    });

    frag.appendChild(row);

    if (node.type === "dir" && node.expanded) {
      for (const ch of node.children) renderNode(ch, depth + 1);
    }
  };

  for (const ch of exState.root.children) renderNode(ch, 0);
  ui.exTree.appendChild(frag);
}

async function refreshExamplesTreeFromPC() {
  if (!exState.root.handle) { renderExTree(); return; }

  ui.exTree.innerHTML = `<div class="hint">Carregando exemplos...</div>`;

  const ok = await ensureReadPermission(exState.root.handle);
  if (!ok) {
    ui.exTree.innerHTML = `<div class="hint">Permissão negada. Clique em <span class="mono">Escolher pasta</span> novamente.</div>`;
    return;
  }

  try {
    exState.root.loaded = false;
    exState.root.children = [];
    exState.selectedKey = null;

    await loadDirChildren(exState.root);
    exState.root.loaded = true;

    renderExTree();
  } catch (e) {
    ui.exTree.innerHTML = `<div class="hint">Erro ao listar pasta: ${String(e.message || e)}</div>`;
  }
}

ui.btnPickExamples.addEventListener("click", async () => {
  try {
    const dir = await window.showDirectoryPicker({ mode: "read" });
    const ok = await ensureReadPermission(dir);
    if (!ok) { alert("Sem permissão para ler a pasta."); return; }

    exState.root.handle = dir;
    exState.root.label = dir.name || "(pasta)";
    ui.exRootPath.textContent = exState.root.label;

    exState.root.loaded = false;
    exState.root.children = [];
    exState.selectedKey = null;

    try { await idbSet("examplesDir", dir); } catch {}

    await refreshExamplesTreeFromPC();
  } catch (e) {
    if (String(e).includes("AbortError")) return;
    alert("Erro ao escolher pasta: " + (e.message || e));
  }
});

ui.btnExRefresh.addEventListener("click", refreshExamplesTreeFromPC);

(async function restoreExamplesDir() {
  try {
    const saved = await idbGet("examplesDir");
    if (!saved) return;
    const ok = await ensureReadPermission(saved);
    if (!ok) return;

    exState.root.handle = saved;
    exState.root.label = saved.name || "(pasta)";
    ui.exRootPath.textContent = exState.root.label;

    await refreshExamplesTreeFromPC();
  } catch {}
})();

let currentExample = null;

function showExampleModal({ name, path, code }) {
  currentExample = { name, path, code };
  ui.exModalTitle.textContent = name;
  ui.exModalPath.textContent = path;
  ui.exModalCode.textContent = code;
  ui.exModal.classList.remove("hidden");
  ui.btnExRun.disabled = !dev.connected;
}
function hideExampleModal() {
  ui.exModal.classList.add("hidden");
  currentExample = null;
}

ui.btnExClose.addEventListener("click", hideExampleModal);
ui.exModal.addEventListener("click", (ev) => { if (ev.target === ui.exModal) hideExampleModal(); });

async function openExampleReadOnlyFromPC(fileHandle, fileName, keyPath) {
  try {
    const file = await fileHandle.getFile();
    const code = await file.text();
    const shownPath = (exState.root.label ? (exState.root.label + "/") : "") + keyPath.replace(/^root\//, "");
    showExampleModal({ name: fileName, path: shownPath, code });
  } catch (e) {
    alert("Erro ao abrir exemplo: " + (e.message || e));
  }
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {}
  prompt("Copie (Ctrl+C):", text);
}

ui.btnExCopy.addEventListener("click", async () => {
  if (!currentExample) return;
  await copyTextToClipboard(currentExample.code);
});

async function runExampleCode(code) {
  if (!dev.connected) { alert("Conecte na placa para rodar."); return; }
  if (runInProgress) return;

  const py = `
try:
${indent(code, 4)}
except Exception as e:
    import sys
    sys.print_exception(e)

print("___END___")
`;

  runInProgress = true;
  ui.btnRun.disabled = true;

  try {
    await dev.rawExec(py, { endMarker: "___END___", timeoutMs: 60000 });
  } catch (e) {
    if (e?.name === "AbortError") return;
    alert("Erro ao rodar exemplo: " + (e.message || e));
  } finally {
    runInProgress = false;
    ui.btnRun.disabled = !dev.connected;
  }
}

ui.btnExRun.addEventListener("click", async () => {
  if (!currentExample) return;
  if (!dev.connected) { alert("Conecte na placa para rodar."); return; }
  replOnSerialActivity();
  await runExampleCode(currentExample.code);
});

// ================================
// Tutorial (estilo Scratch)
// ================================
const TOUR_DONE_KEY = "mihu_tour_done_v1";
let tourIndex = 0;
let tourSteps = [];
let tourOpen = false;

function tourBuildSteps(){
  return [
    {
      sel: null, place: "center",
      title: "Bem-vindo ao MIHU STUDIO",
      body: `
        Esse tutorial mostra para que serve cada parte da tela.<br><br>
        <span class="muted">Dica:</span> use <code>Próximo</code> e <code>Voltar</code>.
      `
    },
    { sel:"#btnConnect", place:"bottom", title:"Conectar na placa",
      body:`Clique em <code>Conectar</code> para escolher a porta USB. Quando ficar online, os botões liberam.` },
    { sel:".sidebar", place:"right", title:"Arquivos da placa",
      body:`Aqui ficam os arquivos dentro do ESP (MicroPython). Duplo clique abre pastas/arquivos.` },
    { sel:".editor", place:"left", title:"Editor",
      body:`Aqui você escreve o código. As abas em cima ajudam a trabalhar com vários arquivos.` },
    { sel:"#btnRun", place:"bottom", title:"Executar",
      body:`Roda o código do editor direto na placa (RAW REPL). Bom para testar rápido.` },
    { sel:"#btnStop", place:"bottom", title:"Stop",
      body:`Para loops e travamentos: envia <code>Ctrl+C</code> e tenta parar tudo com força.` },
    { sel:"#btnSoftReset", place:"bottom", title:"Soft reset",
      body:`Reinicia o MicroPython sem desligar a placa. Use para voltar ao estado “limpo”.` },
    { sel:"#repl", place:"top", title:"REPL (terminal)",
      body:`Mostra prints e deixa digitar comandos. No modo <code>AUTO</code> ele abre quando chega serial.`,
      onEnter:()=> setReplMode("show")
    },
    { sel:"#btnReplMode", place:"top", title:"Modo do REPL",
      body:`<code>AUTO</code> abre quando chega serial • <code>SHOW</code> sempre aberto • <code>HIDE</code> minimiza.` },
    { sel:"#btnExamplesFab", place:"right", title:"Exemplos (no PC)",
      body:`Aqui você abre exemplos do computador. O aluno pode <code>copiar</code> e <code>rodar</code>, sem editar o original.` },
    { sel:"#btnPickExamples", place:"right", title:"Escolher pasta de exemplos",
      body:`Clique em <code>Escolher pasta</code> e selecione sua pasta no PC. A árvore mostra subpastas e .py.`,
      onEnter:()=> ui.examplesDrawer.classList.remove("hidden")
    },
    { sel:null, place:"center", title:"Pronto!",
      body:`Se quiser, eu crio uma versão “modo criança” com frases mais simples e mais ícones.`,
      onEnter:()=> setReplMode("auto")
    }
  ];
}

function tourOpenUI(){
  ui.tour.classList.remove("hidden");
  ui.tour.setAttribute("aria-hidden","false");
  tourOpen = true;
}
function tourCloseUI(){
  ui.tour.classList.add("hidden");
  ui.tour.setAttribute("aria-hidden","true");
  ui.tourHL.style.cssText = "";
  ui.tourCard.style.cssText = "";
  tourOpen = false;
}
function tourStart(force=false){
  if (!force && localStorage.getItem(TOUR_DONE_KEY)==="1") return;
  tourSteps = tourBuildSteps();
  tourIndex = 0;
  tourOpenUI();
  tourShowStep(tourIndex);
}
function tourEnd(markDone=true){
  if (markDone) localStorage.setItem(TOUR_DONE_KEY,"1");
  tourCloseUI();
}
function tourNext(){
  const prev = tourSteps[tourIndex];
  if (prev?.onLeave) try{prev.onLeave();}catch{}
  tourIndex = Math.min(tourIndex+1, tourSteps.length-1);
  tourShowStep(tourIndex);
}
function tourPrev(){
  const prev = tourSteps[tourIndex];
  if (prev?.onLeave) try{prev.onLeave();}catch{}
  tourIndex = Math.max(tourIndex-1, 0);
  tourShowStep(tourIndex);
}

function tourShowStep(i){
  const step = tourSteps[i];
  ui.tourTitle.textContent = step.title || "Tutorial";
  ui.tourBody.innerHTML = step.body || "";
  ui.tourProg.textContent = `${i+1}/${tourSteps.length}`;
  ui.btnTourPrev.disabled = (i===0);
  ui.btnTourNext.textContent = (i===tourSteps.length-1) ? "Finalizar" : "Próximo";

  if (step.onEnter) try{step.onEnter();}catch{}

  if (!step.sel || step.place==="center") {
    ui.tourHL.style.opacity = "0";
    ui.tourCard.style.left = "50%";
    ui.tourCard.style.top = "50%";
    ui.tourCard.style.transform = "translate(-50%, -50%)";
    return;
  }

  const el = document.querySelector(step.sel);
  if (!el) {
    ui.tourHL.style.opacity = "0";
    ui.tourCard.style.left = "50%";
    ui.tourCard.style.top = "50%";
    ui.tourCard.style.transform = "translate(-50%, -50%)";
    return;
  }

  try { el.scrollIntoView({ behavior:"smooth", block:"center", inline:"center" }); } catch {}
  setTimeout(()=> tourPositionToElement(el, step.place || "bottom"), 120);
}

function tourPositionToElement(el, place){
  const r = el.getBoundingClientRect();
  const pad = 8;

  const x = Math.max(10, r.left - pad);
  const y = Math.max(10, r.top - pad);
  const w = Math.min(window.innerWidth - 20, r.width + pad*2);
  const h = Math.min(window.innerHeight - 20, r.height + pad*2);

  ui.tourHL.style.opacity = "1";
  ui.tourHL.style.left = x + "px";
  ui.tourHL.style.top = y + "px";
  ui.tourHL.style.width = w + "px";
  ui.tourHL.style.height = h + "px";

  const cardW = ui.tourCard.offsetWidth || 420;
  const cardH = ui.tourCard.offsetHeight || 220;

  let cx = x, cy = y;

  if (place === "right") {
    cx = x + w + 12;
    cy = y + Math.max(0, (h - cardH) / 2);
  } else if (place === "left") {
    cx = x - cardW - 12;
    cy = y + Math.max(0, (h - cardH) / 2);
  } else if (place === "top") {
    cx = x + Math.max(0, (w - cardW) / 2);
    cy = y - cardH - 12;
  } else {
    cx = x + Math.max(0, (w - cardW) / 2);
    cy = y + h + 12;
  }

  cx = Math.max(10, Math.min(cx, window.innerWidth - cardW - 10));
  cy = Math.max(10, Math.min(cy, window.innerHeight - cardH - 10));

  ui.tourCard.style.left = cx + "px";
  ui.tourCard.style.top = cy + "px";
  ui.tourCard.style.transform = "none";
}

ui.btnTour.addEventListener("click", () => tourStart(true));
ui.btnTourPrev.addEventListener("click", tourPrev);
ui.btnTourNext.addEventListener("click", () => {
  if (tourIndex >= tourSteps.length - 1) tourEnd(true);
  else tourNext();
});
ui.btnTourEnd.addEventListener("click", () => tourEnd(false));
ui.btnTourEndX.addEventListener("click", () => tourEnd(false));
ui.tourBackdrop.addEventListener("click", () => tourEnd(false));

window.addEventListener("keydown", (e) => {
  if (!tourOpen) return;
  if (e.key === "Escape") { e.preventDefault(); tourEnd(false); }
  if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); ui.btnTourNext.click(); }
  if (e.key === "ArrowLeft") { e.preventDefault(); ui.btnTourPrev.click(); }
});
window.addEventListener("resize", () => { if (tourOpen) tourShowStep(tourIndex); });

// ================================
// UI wiring
// ================================
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

  ui.btnReplMode.disabled = !connected;
  ui.btnReplClear.disabled = !connected;

  if (!connected) {
    selectedItem = null;
    updateFileActionButtons();
  } else {
    updateFileActionButtons();
  }

  if (!ui.exModal.classList.contains("hidden")) {
    ui.btnExRun.disabled = !connected;
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
      await dev.disconnect();
      mpBannerShown = false;
      ui.terminal.textContent = "";

      setStatus(false, "Desconectado");
      setConnectedUI(false);
      setConnectButtonState(false);

      ui.fileList.innerHTML = `<div class="hint">Conecte para listar os arquivos.</div>`;
      return;
    }

    const baudRate = Number(ui.baud.value || "115200");
    setStatus(false, "Conectando...");
    await dev.connect({ baudRate, request: true });

    setStatus(true, "Conectado (porta selecionada no navegador)");
    setConnectedUI(true);
    setConnectButtonState(true);

    setReplMode(replMode);

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

// shortcuts
window.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

  if (ctrlOrCmd && e.key === "Enter") { e.preventDefault(); if (!ui.btnRun.disabled) runEditor(); }
  if (ctrlOrCmd && (e.key === "s" || e.key === "S")) { e.preventDefault(); if (!ui.btnSaveToDevice.disabled) saveToDevice(); }

  if (ctrlOrCmd && (e.key === "c" || e.key === "C")) {
    const ae = document.activeElement;
    const isTyping = !!ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA");
    if (!isTyping) {
      e.preventDefault();
      if (!ui.btnStop.disabled) stopProgram();
    }
  }
});

// ================================
// Boot
// ================================
initEditor();
newTab("main.py", `# Exemplo\nprint("Olá do MIHU STUDIO!")\n`);
renderTabs();

setConnectedUI(false);
setConnectButtonState(false);
setStatus(false, "Nenhuma porta conectada");

// restore repl state
replLastExpanded = Number(localStorage.getItem(REPL_HEIGHT_KEY) || 260);
setReplMode(replMode);

// auto tutorial 1ª vez
setTimeout(() => tourStart(false), 700);
