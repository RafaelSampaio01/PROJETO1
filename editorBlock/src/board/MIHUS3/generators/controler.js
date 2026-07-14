// src/board/MIHUS3/generators/controler.js

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

// =====================================================
// HELPERS GLOBAIS MIHU
// =====================================================

if (typeof window.mihuAddImport !== "function") {
    window.mihuAddImport = function(importLine) {
        window.MIHU_IMPORTS = window.MIHU_IMPORTS || new Set();
        window.MIHU_IMPORTS.add(importLine);
    };
}

if (typeof window.mihuAddSetup !== "function") {
    window.mihuAddSetup = function(setupLine) {
        window.MIHU_SETUP = window.MIHU_SETUP || new Set();
        window.MIHU_SETUP.add(setupLine);
    };
}

// =====================================================
// BLOCO PRINCIPAL SETUP / LOOP
// =====================================================

Blockly.Python.forBlock["mihu_setup_loop"] = function(block, generator) {
    generator = generator || Blockly.Python;

    let setupCode = generator.statementToCode(block, "SETUP") || "";
    let loopCode = generator.statementToCode(block, "LOOP") || "";

    setupCode = normalizarBlocoBlockly(setupCode, false);
    loopCode = normalizarBlocoBlockly(loopCode, true);

    let code = "";

    // =====================================================
    // RUNTIME OCULTO DO SISTEMA
    // =====================================================
    code += "from time import sleep_ms\n";
    code += "from lib.mihuButton.mihuButton import read_menu\n\n";

    code += "def _mihu_check_exit():\n";
    code += "    key = read_menu()\n";
    code += "    if key == \"BACK\":\n";
    code += "        return True\n";
    code += "    return False\n\n";

    // =====================================================
    // SETUP
    // =====================================================
    if (setupCode.trim()) {
        code += setupCode.trimEnd() + "\n\n";
    }

    // =====================================================
    // LOOP PRINCIPAL
    // =====================================================
    code += "while True:\n";
    code += "    if _mihu_check_exit():\n";
    code += "        break\n\n";

    if (loopCode.trim()) {
        code += loopCode.trimEnd() + "\n";
    } else {
        code += "    pass\n";
    }

    return code;
};

Blockly.Python["mihu_setup_loop"] =
    Blockly.Python.forBlock["mihu_setup_loop"];

function normalizarBlocoBlockly(code, deveIndentar) {
    if (!code) return "";

    let linhas = code.split("\n");

    while (linhas.length && linhas[0].trim() === "") linhas.shift();
    while (linhas.length && linhas[linhas.length - 1].trim() === "") linhas.pop();

    if (!linhas.length) return "";

    let menorIndentacao = null;

    for (let linha of linhas) {
        if (linha.trim() === "") continue;

        let match = linha.match(/^ */);
        let qtd = match ? match[0].length : 0;

        if (menorIndentacao === null || qtd < menorIndentacao) {
            menorIndentacao = qtd;
        }
    }

    if (menorIndentacao === null) menorIndentacao = 0;

    linhas = linhas.map(linha => {
        if (linha.trim() === "") return "";
        return linha.slice(menorIndentacao);
    });

    if (deveIndentar) {
        linhas = linhas.map(linha => {
            if (linha.trim() === "") return "";
            return "    " + linha;
        });
    }

    return linhas.join("\n");
}

// =====================================================
// ESPERAR SEGUNDOS
// Bloco: time_sleep
// Gera:
// import time
// time.sleep(1)
// =====================================================

Blockly.Python.forBlock["time_sleep"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const seconds = generator.valueToCode(
        block,
        "SECONDS",
        generator.ORDER_ATOMIC
    ) || "1";

    window.mihuAddImport("import time");

    return `time.sleep(${seconds})\n`;
};

Blockly.Python["time_sleep"] =
    Blockly.Python.forBlock["time_sleep"];

function mihuStatementCode(generator, block, inputName) {
    const code = generator.statementToCode(block, inputName) || "";
    return code.trim() ? code : "    pass\n";
}

Blockly.Python.forBlock["mihu_control_wait"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const seconds = generator.valueToCode(
        block,
        "SECONDS",
        generator.ORDER_ATOMIC
    ) || "1";

    window.mihuAddImport("import time");

    return `time.sleep(${seconds})\n`;
};

Blockly.Python["mihu_control_wait"] =
    Blockly.Python.forBlock["mihu_control_wait"];

Blockly.Python.forBlock["mihu_control_repeat"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const times = generator.valueToCode(
        block,
        "TIMES",
        generator.ORDER_ATOMIC
    ) || "10";
    const branch = mihuStatementCode(generator, block, "DO");

    return `for _ in range(int(${times})):\n${branch}`;
};

Blockly.Python["mihu_control_repeat"] =
    Blockly.Python.forBlock["mihu_control_repeat"];

Blockly.Python.forBlock["mihu_control_forever"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const branch = mihuStatementCode(generator, block, "DO");

    return `while True:\n${branch}`;
};

Blockly.Python["mihu_control_forever"] =
    Blockly.Python.forBlock["mihu_control_forever"];

Blockly.Python.forBlock["mihu_control_if"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const condition = generator.valueToCode(
        block,
        "COND",
        generator.ORDER_NONE
    ) || "False";
    const branch = mihuStatementCode(generator, block, "DO");

    return `if ${condition}:\n${branch}`;
};

Blockly.Python["mihu_control_if"] =
    Blockly.Python.forBlock["mihu_control_if"];

Blockly.Python.forBlock["mihu_control_if_else"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const condition = generator.valueToCode(
        block,
        "COND",
        generator.ORDER_NONE
    ) || "False";
    const doBranch = mihuStatementCode(generator, block, "DO");
    const elseBranch = mihuStatementCode(generator, block, "ELSE");

    return `if ${condition}:\n${doBranch}else:\n${elseBranch}`;
};

Blockly.Python["mihu_control_if_else"] =
    Blockly.Python.forBlock["mihu_control_if_else"];

Blockly.Python.forBlock["mihu_control_wait_until"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const condition = generator.valueToCode(
        block,
        "COND",
        generator.ORDER_NONE
    ) || "False";

    window.mihuAddImport("import time");

    return `while not (${condition}):\n    time.sleep(0.01)\n`;
};

Blockly.Python["mihu_control_wait_until"] =
    Blockly.Python.forBlock["mihu_control_wait_until"];

Blockly.Python.forBlock["mihu_control_repeat_until"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const condition = generator.valueToCode(
        block,
        "COND",
        generator.ORDER_NONE
    ) || "False";
    const branch = mihuStatementCode(generator, block, "DO");

    return `while not (${condition}):\n${branch}`;
};

Blockly.Python["mihu_control_repeat_until"] =
    Blockly.Python.forBlock["mihu_control_repeat_until"];

Blockly.Python.forBlock["mihu_control_stop"] = function() {
    return "raise SystemExit\n";
};

Blockly.Python["mihu_control_stop"] =
    Blockly.Python.forBlock["mihu_control_stop"];

Blockly.Python.forBlock["mihu_control_when_clone_starts"] = function() {
    return "";
};

Blockly.Python["mihu_control_when_clone_starts"] =
    Blockly.Python.forBlock["mihu_control_when_clone_starts"];

Blockly.Python.forBlock["mihu_control_create_clone"] = function() {
    return "# cria um clone de ti mesmo\n";
};

Blockly.Python["mihu_control_create_clone"] =
    Blockly.Python.forBlock["mihu_control_create_clone"];

Blockly.Python.forBlock["mihu_control_delete_clone"] = function() {
    return "# remove-te como clone\n";
};

Blockly.Python["mihu_control_delete_clone"] =
    Blockly.Python.forBlock["mihu_control_delete_clone"];



Blockly.Python.forBlock["camera_robot_control"] = function (block) {
    var motorVertical = block.getFieldValue("MOTOR_VERTICAL");
    var motorHorizontal = block.getFieldValue("MOTOR_HORIZONTAL");
    var motorGarra = block.getFieldValue("MOTOR_GARRA");

    var velMovimento = Blockly.Python.valueToCode(
        block,
        "VEL_MOVIMENTO",
        Blockly.Python.ORDER_ATOMIC
    ) || "100";

    var velGarra = Blockly.Python.valueToCode(
        block,
        "VEL_GARRA",
        Blockly.Python.ORDER_ATOMIC
    ) || "100";

    Blockly.Python.definitions_["import_camera_serial_control"] = `
import time
import sys
import select

try:
    from Lib.mihuMotor import *
except:
    from lib.mihuMotor import *
`;

    Blockly.Python.definitions_["camera_serial_control_vars"] = `
_camera_buffer_serial = ""
_camera_poll = select.poll()
_camera_poll.register(sys.stdin, select.POLLIN)

_camera_ultimo_movimento_ms = time.ticks_ms()
_camera_ultimo_garra_ms = 0
_camera_garra_em_movimento = False

_CAMERA_TIMEOUT_MOVIMENTO_MS = 800
_CAMERA_TEMPO_GARRA_MS = 500
`;

    Blockly.Python.definitions_["camera_serial_control_functions"] = `
def _camera_parar_movimento(motor_vertical, motor_horizontal):
    setMotor(motor_vertical, 0)
    setMotor(motor_horizontal, 0)

def _camera_parar_garra(motor_garra):
    global _camera_garra_em_movimento

    setMotor(motor_garra, 0)
    _camera_garra_em_movimento = False

def _camera_executar_comando(cmd, motor_vertical, motor_horizontal, motor_garra, vel_movimento, vel_garra):
    global _camera_ultimo_movimento_ms
    global _camera_ultimo_garra_ms
    global _camera_garra_em_movimento

    cmd = cmd.strip().upper()

    if cmd == "":
        return

    if cmd == "CIMA":
        setMotor(motor_horizontal, 0)
        setMotor(motor_vertical, vel_movimento)
        _camera_ultimo_movimento_ms = time.ticks_ms()

    elif cmd == "BAIXO":
        setMotor(motor_horizontal, 0)
        setMotor(motor_vertical, -vel_movimento)
        _camera_ultimo_movimento_ms = time.ticks_ms()

    elif cmd == "DIREITA":
        setMotor(motor_vertical, 0)
        setMotor(motor_horizontal, vel_movimento)
        _camera_ultimo_movimento_ms = time.ticks_ms()

    elif cmd == "ESQUERDA":
        setMotor(motor_vertical, 0)
        setMotor(motor_horizontal, -vel_movimento)
        _camera_ultimo_movimento_ms = time.ticks_ms()

    elif cmd == "PARAR":
        _camera_parar_movimento(motor_vertical, motor_horizontal)

    elif cmd == "ABRIR_GARRA":
        setMotor(motor_garra, vel_garra)
        _camera_ultimo_garra_ms = time.ticks_ms()
        _camera_garra_em_movimento = True

    elif cmd == "FECHAR_GARRA":
        setMotor(motor_garra, -vel_garra)
        _camera_ultimo_garra_ms = time.ticks_ms()
        _camera_garra_em_movimento = True

    elif cmd == "PARAR_TUDO":
        _camera_parar_movimento(motor_vertical, motor_horizontal)
        _camera_parar_garra(motor_garra)

def _camera_ler_serial():
    global _camera_buffer_serial

    eventos = _camera_poll.poll(0)

    if not eventos:
        return ""

    try:
        c = sys.stdin.read(1)

        if c is None:
            return ""

        if c == "\\n" or c == "\\r":
            if _camera_buffer_serial != "":
                cmd = _camera_buffer_serial
                _camera_buffer_serial = ""
                return cmd

            return ""

        _camera_buffer_serial += c

        if len(_camera_buffer_serial) > 50:
            _camera_buffer_serial = ""

        return ""

    except:
        return ""

def _camera_verificar_timeout(motor_vertical, motor_horizontal, motor_garra):
    global _camera_garra_em_movimento

    agora = time.ticks_ms()

    if time.ticks_diff(agora, _camera_ultimo_movimento_ms) > _CAMERA_TIMEOUT_MOVIMENTO_MS:
        _camera_parar_movimento(motor_vertical, motor_horizontal)

    if _camera_garra_em_movimento:
        if time.ticks_diff(agora, _camera_ultimo_garra_ms) > _CAMERA_TEMPO_GARRA_MS:
            _camera_parar_garra(motor_garra)

def receberComandoCameraBraco(motor_vertical, motor_horizontal, motor_garra, vel_movimento, vel_garra):
    cmd = _camera_ler_serial()

    if cmd != "":
        _camera_executar_comando(
            cmd,
            motor_vertical,
            motor_horizontal,
            motor_garra,
            vel_movimento,
            vel_garra
        )

    _camera_verificar_timeout(
        motor_vertical,
        motor_horizontal,
        motor_garra
    )
`;

    var code = "receberComandoCameraBraco(" +
        motorVertical + ", " +
        motorHorizontal + ", " +
        motorGarra + ", " +
        velMovimento + ", " +
        velGarra +
        ")\n";

    return code;
};

console.log("Generators controler.js registrados.");
