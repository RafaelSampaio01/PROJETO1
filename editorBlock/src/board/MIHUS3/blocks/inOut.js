
// =====================================================
// DEFINIR PINO DIGITAL
// =====================================================

// src/board/MIHUS3/blocks/inOut.js

// src/board/MIHUS3/blocks/inOut.js

// =====================================================
// DEFINIR PINO DIGITAL
// =====================================================

// =====================================================
// CONFIGURAR MODO DO PINO DIGITAL
// =====================================================

Blockly.Blocks["inout_pin_mode"] = {
    init() {
        this.appendDummyInput()
            .appendField("Configurar pino");

        this.appendValueInput("PIN")
            .setCheck("Number");

        this.appendDummyInput()
            .appendField("como")
            .appendField(new Blockly.FieldDropdown([
                ["ENTRADA", "INPUT"],
                ["SAÍDA", "OUTPUT"],
                ["ENTRADA PULL_UP", "INPUT_PULLUP"],
                ["ENTRADA PULL_DOWN", "INPUT_PULLDOWN"]
            ]), "MODE");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4A90E2");
        this.setTooltip("Configura o modo de funcionamento de um pino digital.");
    }
};


Blockly.Blocks["inout_digital_write"] = {
    init() {
        this.appendDummyInput()
            .appendField("Definir pino digital");

        this.appendValueInput("PIN")
            .setCheck("Number");

        this.appendDummyInput()
            .appendField("como");

        this.appendValueInput("STAT")
            .setCheck("Number");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4A90E2");
        this.setTooltip("Define um pino digital como ALTO ou BAIXO.");
    }
};

// =====================================================
// LER PINO DIGITAL
// =====================================================

Blockly.Blocks["inout_digital_read"] = {
    init() {
        this.appendDummyInput()
            .appendField("Ler pino digital");

        this.appendValueInput("PIN")
            .setCheck("Number");

        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour("#4A90E2");
        this.setTooltip("Lê o estado lógico de um pino digital.");
    }
};

// =====================================================
// DEFINIR PINO PWM
// =====================================================

Blockly.Blocks["inout_pwm_write"] = {
    init() {
        this.appendDummyInput()
            .appendField("Definir PWM no pino");

        this.appendValueInput("PIN")
            .setCheck("Number");

        this.appendDummyInput()
            .appendField("com valor");

        this.appendValueInput("VALUE")
            .setCheck("Number");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4A90E2");
        this.setTooltip("Define o valor PWM de um pino. No MicroPython, use valores de 0 a 65535.");
    }
};

// =====================================================
// LER PINO ANALÓGICO
// =====================================================

Blockly.Blocks["inout_analog_read"] = {
    init() {
        this.appendDummyInput()
            .appendField("Ler pino analógico");

        this.appendValueInput("PIN")
            .setCheck("Number");

        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour("#4A90E2");
        this.setTooltip("Lê o valor analógico de um pino ADC.");
    }
};

// =====================================================
// PARAR PWM
// =====================================================

Blockly.Blocks["inout_pwm_stop"] = {
    init() {
        this.appendDummyInput()
            .appendField("Parar PWM no pino");

        this.appendValueInput("PIN")
            .setCheck("Number");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4A90E2");
        this.setTooltip("Desativa o PWM configurado no pino informado.");
    }
};


// =====================================================
// LEITURA TOUCH
// =====================================================

Blockly.Blocks["inout_touch_read"] = {
    init() {
        this.appendDummyInput()
            .appendField("Ler toque no pino");

        this.appendValueInput("PIN")
            .setCheck("Number");

        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour("#4A90E2");
        this.setTooltip("Lê o valor do sensor capacitivo Touch no pino selecionado.");
    }
};


// =====================================================
// INTERRUPÇÃO DIGITAL
// =====================================================

Blockly.Blocks["inout_digital_interrupt"] = {
    init() {
        this.appendDummyInput()
            .appendField("Quando o pino digital");

        this.appendValueInput("PIN")
            .setCheck("Number");

        this.appendDummyInput()
            .appendField("mudar para")
            .appendField(new Blockly.FieldDropdown([
                ["ALTO (1)", "1"],
                ["BAIXO (0)", "0"]
            ]), "LEVEL");

        this.appendStatementInput("DO")
            .appendField("faça");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4A90E2");
        this.setTooltip("Executa comandos automaticamente quando o pino digital muda de estado.");
    }
};


console.log("Blocos de Entrada/Saída MIHU registrados.");

