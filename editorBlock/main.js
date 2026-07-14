// main.js

async function initializeMIHUStudio() {
    console.log("Inicializando MIHU STUDIO...");

    try {
        // 0. Aplicar idioma da interface e do Blockly
        if (typeof initializeMihuI18n === "function") {
            await initializeMihuI18n();
        }

        // 1. Inicializar Blockly
        workspace = await initializeBlockly();

        // 2. Configurar listener para atualizar código
        if (workspace) {
            workspace.addChangeListener(() => {
                saveActiveProgram();
                updateCodePreview();
            });
        }

        // 3. Inicializar Program Manager
        initializeProgramManager();

        // 4. Inicializar Terminal
        initializeTerminal();

        // Inicializar editor de código
        initializeMonacoEditor();

        // Gerenciador de arquivos da controladora
        if (typeof initializeBoardFileManager === "function") initializeBoardFileManager();

        // 5. Inicializar UI Handlers
        initializeUIHandlers();

        // 6. Atualizar preview inicial
        updateCodePreview();

        console.log("MIHU STUDIO inicializado com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar MIHU STUDIO:", error);
    }
}

function createInitialExample() {
    if (!workspace) return;

    // Verificar se já existem blocos no workspace
    const blocks = workspace.getAllBlocks(false);

    if (blocks.length > 0) {
        updateCodePreview();
        return;
    }

    createRobotSensorExample();
}

function createRobotSensorExample() {
    if (!workspace) return;

    workspace.clear();

    const makeBlock = (type, x = 0, y = 0) => {
        const block = workspace.newBlock(type);
        block.initSvg();
        block.render();
        block.moveBy(x, y);
        return block;
    };

    const makeNumber = (value) => {
        const block = makeBlock("math_number");
        block.setFieldValue(String(value), "NUM");
        return block;
    };

    const makeText = (value) => {
        const block = makeBlock("text");
        block.setFieldValue(value, "TEXT");
        return block;
    };

    const connectValue = (parent, inputName, child) => {
        const input = parent.getInput(inputName);
        if (input && input.connection && child.outputConnection) {
            input.connection.connect(child.outputConnection);
        }
    };

    const connectStatement = (parent, inputName, child) => {
        const input = parent.getInput(inputName);
        if (input && input.connection && child.previousConnection) {
            input.connection.connect(child.previousConnection);
        }
    };

    const connectNext = (previous, next) => {
        if (previous.nextConnection && next.previousConnection) {
            previous.nextConnection.connect(next.previousConnection);
        }
    };

    const initBlock = makeBlock("mihu_setup_loop", 40, 40);
    const foreverBlock = makeBlock("mihu_control_forever");

    const motorForward = makeBlock("mihu_motor_interface");
    motorForward.setFieldValue("M1", "MOTOR");
    connectValue(motorForward, "POWER", makeNumber(50));

    const waitBlock = makeBlock("mihu_control_wait");
    connectValue(waitBlock, "SECONDS", makeNumber(1));

    const ultrasonicIf = makeBlock("mihu_control_if");
    const ultrasonicCompare = makeBlock("mihu_operator_compare");
    ultrasonicCompare.setFieldValue("LT", "OP");
    const ultrasonicSensor = makeBlock("mihu_sensor_ultrasonic");
    ultrasonicSensor.setFieldValue("P1", "PORT");
    connectValue(ultrasonicCompare, "A", ultrasonicSensor);
    connectValue(ultrasonicCompare, "B", makeNumber(15));
    connectValue(ultrasonicIf, "COND", ultrasonicCompare);

    const motorAvoid = makeBlock("mihu_motor_interface");
    motorAvoid.setFieldValue("M1", "MOTOR");
    connectValue(motorAvoid, "POWER", makeNumber(-50));
    connectStatement(ultrasonicIf, "DO", motorAvoid);

    const colorIf = makeBlock("mihu_control_if");
    const colorCompare = makeBlock("mihu_operator_compare");
    colorCompare.setFieldValue("EQ", "OP");
    const colorSensor = makeBlock("mihu_sensor_color");
    colorSensor.setFieldValue("P2", "PORT");
    connectValue(colorCompare, "A", colorSensor);
    connectValue(colorCompare, "B", makeText("vermelho"));
    connectValue(colorIf, "COND", colorCompare);

    const motorColor = makeBlock("mihu_motor_interface");
    motorColor.setFieldValue("M2", "MOTOR");
    connectValue(motorColor, "POWER", makeNumber(30));
    connectStatement(colorIf, "DO", motorColor);

    const giroIf = makeBlock("mihu_control_if");
    const giroCompare = makeBlock("mihu_operator_compare");
    giroCompare.setFieldValue("GT", "OP");
    const giroSensor = makeBlock("mihu_sensor_ahrs_get");
    giroSensor.setFieldValue("P3", "PORT");
    giroSensor.setFieldValue("ROLL_ANGLE", "MODE");
    connectValue(giroCompare, "A", giroSensor);
    connectValue(giroCompare, "B", makeNumber(50));
    connectValue(giroIf, "COND", giroCompare);

    const motorGiro = makeBlock("mihu_motor_interface");
    motorGiro.setFieldValue("M2", "MOTOR");
    connectValue(motorGiro, "POWER", makeNumber(-30));
    connectStatement(giroIf, "DO", motorGiro);

    connectStatement(initBlock, "LOOP", foreverBlock);
    connectStatement(foreverBlock, "DO", motorForward);
    connectNext(motorForward, waitBlock);
    connectNext(waitBlock, ultrasonicIf);
    connectNext(ultrasonicIf, colorIf);
    connectNext(colorIf, giroIf);

    workspace.getAllBlocks(false).forEach((block) => {
        if (typeof block.render === "function") {
            block.render();
        }
    });

    if (typeof saveActiveProgram === "function") {
        saveActiveProgram();
    }

    // Centralizar visualmente o workspace, se possível
    if (Blockly.svgResize) {
        Blockly.svgResize(workspace);
    }

    // Atualizar código
    updateCodePreview();
}

function resetWorkspaceToExample() {
    createRobotSensorExample();
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        initializeMIHUStudio();
    }, 100);
});

// Redimensionar quando a janela mudar de tamanho
window.addEventListener("resize", () => {
    if (workspace) {
        Blockly.svgResize(workspace);
    }
});
