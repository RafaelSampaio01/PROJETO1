let boardFileEditor = null;
let boardFileEditorReady = false;
let boardFilePath = "";
let boardFileDirty = false;

function boardFilesText(key, fallback) {
    return typeof window.mihuT === "function" ? window.mihuT(key) : fallback;
}

function setBoardFileStatus(text, kind = "") {
    const status = document.getElementById("boardFileStatus");
    if (!status) return;
    status.textContent = text;
    status.className = `board-file-status${kind ? ` is-${kind}` : ""}`;
}

function setBoardFileSelected(path, content) {
    boardFilePath = path || "";
    boardFileDirty = false;
    document.getElementById("boardFilePath").textContent = path || boardFilesText("files.selectHint", "Selecione um arquivo para editar");
    const save = document.getElementById("saveBoardFileBtn");
    if (save) save.disabled = !path;
    if (boardFileEditorReady) {
        boardFileEditor.setValue(content || "");
        boardFileEditor.updateOptions({readOnly: !path});
        monaco.editor.setModelLanguage(boardFileEditor.getModel(), /\.json$/i.test(path) ? "json" : /\.(txt|md|csv)$/i.test(path) ? "plaintext" : "python");
    }
}

function renderBoardFileTree(items, parent) {
    (items || []).forEach(item => {
        const branch = document.createElement("div");
        const row = document.createElement("div");
        row.className = `file-tree-row is-${item.type}`;
        row.style.paddingLeft = `${8 + ((item.path.match(/\//g) || []).length - 1) * 14}px`;
        row.dataset.path = item.path;
        row.setAttribute("role", "treeitem");
        row.innerHTML = `<span class="file-tree-caret">${item.type === "folder" ? "▾" : ""}</span><span class="file-tree-icon">${item.type === "folder" ? "📁" : "🐍"}</span><span></span>`;
        row.lastElementChild.textContent = item.name;
        branch.appendChild(row);
        if (item.type === "folder") {
            const children = document.createElement("div");
            children.className = "file-tree-children";
            renderBoardFileTree(item.children, children);
            branch.appendChild(children);
            row.addEventListener("click", () => {
                children.hidden = !children.hidden;
                row.firstElementChild.textContent = children.hidden ? "▸" : "▾";
            });
        } else {
            row.addEventListener("click", async () => {
                if (boardFileDirty && !confirm(boardFilesText("files.discard", "Descartar alterações não salvas?"))) return;
                document.querySelectorAll(".file-tree-row.is-active").forEach(node => node.classList.remove("is-active"));
                row.classList.add("is-active");
                setBoardFileStatus(boardFilesText("files.loading", "Carregando arquivo..."));
                try {
                    const content = await getBoardFile(item.path);
                    setBoardFileSelected(item.path, content);
                    setBoardFileStatus("");
                    boardFileEditor?.focus();
                } catch (error) { setBoardFileStatus(error.message, "error"); }
            });
        }
        parent.appendChild(branch);
    });
}

async function refreshBoardFiles() {
    const tree = document.getElementById("boardFileTree");
    if (!tree) return;
    if (!isBoardSerialConnected()) {
        tree.innerHTML = "";
        setBoardFileStatus(boardFilesText("files.connectHint", "Conecte a controladora para carregar os arquivos."));
        return;
    }
    setBoardFileStatus(boardFilesText("files.loadingTree", "Carregando árvore da placa..."));
    try {
        const items = await getBoardFileTree();
        tree.innerHTML = "";
        renderBoardFileTree(items, tree);
        setBoardFileStatus(items.length ? "" : boardFilesText("files.empty", "Nenhum arquivo encontrado."));
    } catch (error) { setBoardFileStatus(error.message, "error"); }
}

async function saveSelectedBoardFile() {
    if (!boardFilePath || !boardFileEditorReady) return;
    const button = document.getElementById("saveBoardFileBtn");
    button.disabled = true;
    setBoardFileStatus(boardFilesText("files.saving", "Salvando na controladora..."));
    try {
        await saveBoardFile(boardFilePath, boardFileEditor.getValue());
        boardFileDirty = false;
        setBoardFileStatus(boardFilesText("files.saved", "Arquivo salvo com sucesso."), "success");
    } catch (error) { setBoardFileStatus(error.message, "error"); }
    finally { button.disabled = !boardFilePath; }
}

function openTerminalPane(name) {
    const files = name === "files";
    document.querySelector(".terminal")?.classList.toggle("file-manager-open", files);
    document.getElementById("terminalPane").hidden = files;
    document.getElementById("filesPane").hidden = !files;
    document.getElementById("terminalActions").hidden = files;
    document.getElementById("fileManagerActions").hidden = !files;
    document.getElementById("terminalTab").classList.toggle("is-active", !files);
    document.getElementById("filesTab").classList.toggle("is-active", files);
    document.getElementById("terminalTab").setAttribute("aria-selected", String(!files));
    document.getElementById("filesTab").setAttribute("aria-selected", String(files));
    if (files) { boardFileEditor?.layout(); refreshBoardFiles(); }
}

function initializeBoardFileManager() {
    document.getElementById("terminalTab")?.addEventListener("click", () => openTerminalPane("terminal"));
    document.getElementById("filesTab")?.addEventListener("click", () => openTerminalPane("files"));
    document.getElementById("refreshFilesBtn")?.addEventListener("click", refreshBoardFiles);
    document.getElementById("saveBoardFileBtn")?.addEventListener("click", saveSelectedBoardFile);
    window.addEventListener("mihu:serial-connection", event => {
        if (!event.detail.connected) {
            document.getElementById("boardFileTree").innerHTML = "";
            setBoardFileSelected("", "");
            setBoardFileStatus(boardFilesText("files.connectHint", "Conecte a controladora para carregar os arquivos."));
        }
    });
    require(["vs/editor/editor.main"], () => {
        boardFileEditor = monaco.editor.create(document.getElementById("boardFileEditor"), {value:"", language:"python", theme:"mihu-dark", readOnly:true, automaticLayout:true, minimap:{enabled:false}, fontSize:13, lineHeight:20, fontFamily:"Consolas, Monaco, monospace", scrollBeyondLastLine:false, tabSize:4, insertSpaces:true});
        boardFileEditorReady = true;
        boardFileEditor.onDidChangeModelContent(() => {
            if (!boardFilePath) return;
            boardFileDirty = true;
            const path = document.getElementById("boardFilePath");
            if (path && !path.textContent.endsWith(" •")) path.textContent += " •";
        });
    });
}
