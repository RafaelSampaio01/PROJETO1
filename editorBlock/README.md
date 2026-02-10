# MIHU.STUDIO (Web + Blockly + MicroPython via USB)

Este projeto roda **no navegador** e se comunica com a controladora (ESP32/MIHU) usando **Web Serial API**.

## Requisitos
- Navegador: **Chrome** ou **Edge** (desktop).
- A página deve estar em **contexto seguro**: `http://localhost/...` ou `https://...`  
  (não funciona abrindo `index.html` em `file://`).

## Como rodar (Windows / macOS / Linux)
1. Conecte a placa via USB.
2. Abra um terminal na pasta do projeto e rode um servidor local:

### Opção A: Python
```bash
python -m http.server 8000
```

3. Abra no navegador:
- `http://localhost:8000`

4. Clique em **Conectar** e selecione a porta da placa.

## O que já está funcional
- Terminal com leitura em tempo real.
- Envio de comandos no REPL (>>>).
- **Executar**: envia o código pelo **RAW REPL** (robusto).
- **Executar e Salvar**: salva o arquivo `.py` no filesystem da placa e executa.
- **Stop**: interrompe com Ctrl-C.

## Dicas rápidas
- No terminal, comandos locais: `help`, `status`, `clear`, etc.
- Para rodar comandos MicroPython: use `help()` / `print(...)` / etc.
- Modo avançado: `:raw` e `:friendly` para alternar REPL.

Se sua placa usar outro baudrate, ajuste em `modules/serial-terminal.js`:
```js
await _port.open({ baudRate: 115200 });
```
