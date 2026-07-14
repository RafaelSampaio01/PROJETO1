// server.js

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FIRMWARE_DIR = path.join(__dirname, "firmware");

app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

// Servir a pasta raiz do projeto
app.use(express.static(__dirname));

// Servir explicitamente a pasta src
app.use("/src", express.static(path.join(__dirname, "src")));

app.get("/api/firmware", (req, res) => {
    fs.mkdirSync(FIRMWARE_DIR, { recursive: true });
    const files = fs.readdirSync(FIRMWARE_DIR, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".bin"))
        .map(entry => {
            const stats = fs.statSync(path.join(FIRMWARE_DIR, entry.name));
            return { name: entry.name, size: stats.size, modified: stats.mtime.toISOString() };
        })
        .sort((a, b) => b.modified.localeCompare(a.modified));
    res.json({ folder: "firmware", files });
});

app.get("/api/firmware/:name", (req, res) => {
    const name = path.basename(req.params.name);
    if (name !== req.params.name || !name.toLowerCase().endsWith(".bin")) {
        return res.status(400).json({ error: "Nome de firmware inválido." });
    }

    const filePath = path.join(FIRMWARE_DIR, name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Firmware não encontrado." });
    res.sendFile(filePath);
});

// Página inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
