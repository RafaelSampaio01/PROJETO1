// modules/monaco-editor.js

let monacoEditor = null;
let monacoReady = false;
let monacoApplyingValue = false;

function initializeMonacoEditor() {
    if (typeof require === "undefined") {
        console.error("Monaco loader não encontrado.");
        return;
    }

    require.config({
        paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs"
        }
    });

    require(["vs/editor/editor.main"], function () {
        monaco.editor.defineTheme("mihu-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "keyword", foreground: "569cd6" },
                { token: "string", foreground: "ce9178" },
                { token: "number", foreground: "b5cea8" },
                { token: "comment", foreground: "6a9955" }
            ],
            colors: {
                "editor.background": "#1a252f",
                "editor.foreground": "#ecf0f1",
                "editorLineNumber.foreground": "#7f8c8d",
                "editorCursor.foreground": "#ffffff",
                "editor.selectionBackground": "#34495e",
                "editor.inactiveSelectionBackground": "#2c3e50"
            }
        });

        const editorElement = document.getElementById("codeEditor");
        if (!editorElement) return;

        monacoEditor = monaco.editor.create(editorElement, {
            value: `# ${typeof window.mihuT === "function" ? window.mihuT("editor.generated") : "Código será gerado aqui"}`,
            language: "python",
            theme: "mihu-dark",
            readOnly: true,
            automaticLayout: true,
            minimap: {
                enabled: false
            },
            fontSize: 13,
            lineHeight: 20,
            fontFamily: "Consolas, Monaco, monospace",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 4,
            insertSpaces: true,
            renderWhitespace: "selection"
        });

        monacoReady = true;

        monacoEditor.onDidChangeModelContent(() => {
            if (monacoApplyingValue || !isCodeModeActive()) return;
            const program = typeof getCurrentProgram === "function" ? getCurrentProgram() : null;
            if (program) {
                program.customCode = monacoEditor.getValue();
                program.customCodeActive = true;
                program.lastModified = new Date().toISOString();
                if (typeof autosaveAll === "function") autosaveAll();
            }
            updateCodeSourceUI();
        });

        if (typeof updateCodePreview === "function") {
            updateCodePreview();
        }

        console.log("Monaco Editor inicializado.");
    });
}

function setMonacoCode(code) {
    if (monacoEditor && monacoReady) {
        const nextValue = code || "";
        if (monacoEditor.getValue() === nextValue) return;
        monacoApplyingValue = true;
        monacoEditor.setValue(nextValue);
        monacoApplyingValue = false;
    }
}

function setMonacoEditable(editable) {
    if (!monacoEditor || !monacoReady) return;
    monacoEditor.updateOptions({ readOnly: !editable });
    if (editable) monacoEditor.focus();
}

function isCodeModeActive() {
    return document.body.classList.contains("code-mode");
}

function getActiveProgramCode() {
    const program = typeof getCurrentProgram === "function" ? getCurrentProgram() : null;
    if (program && program.customCodeActive) return program.customCode || "";
    return typeof generatePythonCode === "function" ? generatePythonCode() : getMonacoCode();
}

function updateCodeSourceUI() {
    const program = typeof getCurrentProgram === "function" ? getCurrentProgram() : null;
    const isCustom = Boolean(program && program.customCodeActive);
    const badge = document.getElementById("codeSourceBadge");
    const resetButton = document.getElementById("resetToBlocksCode");
    if (badge) {
        badge.textContent = typeof window.mihuT === "function"
            ? window.mihuT(isCustom ? "editor.custom" : "editor.generated")
            : (isCustom ? "Código de texto ativo" : "Gerado pelos blocos");
        badge.classList.toggle("is-custom", isCustom);
    }
    if (resetButton) resetButton.hidden = !isCustom;
}

function resetActiveCodeToBlocks() {
    const program = typeof getCurrentProgram === "function" ? getCurrentProgram() : null;
    if (program) {
        program.customCode = "";
        program.customCodeActive = false;
        if (typeof autosaveAll === "function") autosaveAll();
    }
    setMonacoCode(typeof generatePythonCode === "function" ? generatePythonCode() : "");
    updateCodeSourceUI();
}

function getMonacoCode() {
    if (monacoEditor && monacoReady) {
        return monacoEditor.getValue();
    }

    return "";
}

function resizeMonacoEditor() {
    if (monacoEditor && monacoReady) {
        monacoEditor.layout();
    }
}
