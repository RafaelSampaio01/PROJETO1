// Geradores Python dos blocos azuis da categoria controlador.

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function mihuArduinoImport() {
    window.mihuAddImport(`from lib.mihuArduino.mihuGPIO import *`);
}

function mihuControllerImport() {
    window.mihuAddImport(`from lib.mihuController import *`);
}

function mihuSanitizeName(name) {
    return String(name || "programaAluno").replace(/[^a-zA-Z0-9_]/g, "_");
}

function mihuNumberCode(block, generator, inputName, fallback) {
    return generator.valueToCode(block, inputName, generator.ORDER_ATOMIC) || fallback;
}

function mihuStatementBlocks(firstBlock) {
    const blocks = [];
    let current = firstBlock;

    while (current) {
        blocks.push(current);
        current = current.getNextBlock();
    }

    return blocks;
}

function mihuIndentCode(code) {
    const clean = String(code || "").trimEnd();

    if (!clean.trim()) {
        return "    pass\n";
    }

    return clean
        .split("\n")
        .map((line) => line.trim() === "" ? "" : "    " + line)
        .join("\n") + "\n";
}

function mihuSingleBlockCode(block, generator) {
    if (!block) {
        return "";
    }

    let fn = null;

    if (generator.forBlock && generator.forBlock[block.type]) {
        fn = generator.forBlock[block.type];

    } else if (generator[block.type]) {
        fn = generator[block.type];
    }

    if (!fn) {
        console.warn("Generator nao encontrado para o bloco:", block.type);
        return "";
    }

    const code = fn.call(generator, block, generator);

    if (Array.isArray(code)) {
        return code[0] || "";
    }

    return code || "";
}

function mihuBlocksToCode(firstBlock, generator) {
    const blocks = mihuStatementBlocks(firstBlock);
    let code = "";

    blocks.forEach((child) => {
        if (!child) {
            return;
        }

        if (child.type === "mihu_control_forever") {
            code += mihuBlocksToCode(child.getInputTargetBlock("DO"), generator);
            return;
        }

        let childCode = mihuSingleBlockCode(child, generator);

        if (childCode && !childCode.endsWith("\n")) {
            childCode += "\n";
        }

        code += childCode;
    });

    return code;
}

function mihuSplitSetupAndLoop(block, generator) {
    const firstBlock = block.getInputTargetBlock("DO");
    const topBlocks = mihuStatementBlocks(firstBlock);

    let setupCode = "";
    let loopCode = "";

    topBlocks.forEach((child) => {
        if (!child) {
            return;
        }

        if (child.type === "mihu_control_forever") {
            loopCode += mihuBlocksToCode(child.getInputTargetBlock("DO"), generator);

        } else {
            let childCode = mihuSingleBlockCode(child, generator);

            if (childCode && !childCode.endsWith("\n")) {
                childCode += "\n";
            }

            setupCode += childCode;
        }
    });

    return {
        setupCode: setupCode,
        loopCode: loopCode
    };
}


// Bloco azul: Inicializar tarefa1
Blockly.Python.forBlock["mihu_controller_target"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const nomePrograma = mihuSanitizeName(block.getFieldValue("TARGET"));
    const partes = mihuSplitSetupAndLoop(block, generator);

    mihuArduinoImport();

    let code = "";

    code += `# Programa do aluno: ${nomePrograma}\n\n`;

    code += `def setupAluno():\n`;
    code += mihuIndentCode(partes.setupCode);
    code += `\n`;

    code += `def loopAluno():\n`;
    code += mihuIndentCode(partes.loopCode);
    code += `\n`;

    code += `def finalizarAluno():\n`;
    code += `    pass\n`;

    return code;
};

Blockly.Python["mihu_controller_target"] = Blockly.Python.forBlock["mihu_controller_target"];


// Bloco: espera
Blockly.Python.forBlock["mihu_control_wait"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuArduinoImport();

    const seconds = mihuNumberCode(block, generator, "SECONDS", "1");

    return `delay(int((${seconds}) * 1000))\n`;
};

Blockly.Python["mihu_control_wait"] = Blockly.Python.forBlock["mihu_control_wait"];


// Compatibilidade com bloco time_sleep, se existir
Blockly.Python.forBlock["time_sleep"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuArduinoImport();

    const seconds = mihuNumberCode(block, generator, "SECONDS", "1");

    return `delay(int((${seconds}) * 1000))\n`;
};

Blockly.Python["time_sleep"] = Blockly.Python.forBlock["time_sleep"];


// Bloco: repete para sempre
// Importante: aqui NÃO gera while True.
Blockly.Python.forBlock["mihu_control_forever"] = function(block, generator) {
    generator = generator || Blockly.Python;

    return mihuBlocksToCode(block.getInputTargetBlock("DO"), generator);
};

Blockly.Python["mihu_control_forever"] = Blockly.Python.forBlock["mihu_control_forever"];


function controllerOutput(type, callName) {
    Blockly.Python.forBlock[type] = function(block, generator) {
        generator = generator || Blockly.Python;

        mihuControllerImport();

        return [`${callName}()`, generator.ORDER_ATOMIC];
    };

    Blockly.Python[type] = Blockly.Python.forBlock[type];
}

controllerOutput("mihu_controller_left_button", "readLeftButton");
controllerOutput("mihu_controller_read_system_time", "readSystemTime");
controllerOutput("mihu_controller_right_button", "readRightButton");
controllerOutput("mihu_controller_in_volume", "readInVolume");
controllerOutput("mihu_controller_in_voltage", "readInVoltage");


Blockly.Python.forBlock["mihu_controller_set_system_time"] = function() {
    mihuControllerImport();

    return "resetSystemTime()\n";
};

Blockly.Python["mihu_controller_set_system_time"] = Blockly.Python.forBlock["mihu_controller_set_system_time"];


Blockly.Python.forBlock["mihu_controller_buzzer"] = function(block) {
    mihuControllerImport();

    return `setBuzzer(${JSON.stringify(block.getFieldValue("STATE"))})\n`;
};

Blockly.Python["mihu_controller_buzzer"] = Blockly.Python.forBlock["mihu_controller_buzzer"];


Blockly.Python.forBlock["mihu_controller_audio_frequency"] = function(block) {
    mihuControllerImport();

    return `setAudioFrequency(${JSON.stringify(block.getFieldValue("NOTE"))})\n`;
};

Blockly.Python["mihu_controller_audio_frequency"] = Blockly.Python.forBlock["mihu_controller_audio_frequency"];


console.log("Generators controlador MIHU registrados.");