

Blockly.Blocks['mihu_setup_loop'] = {
        init() {
            this.appendStatementInput("SETUP")
                .appendField("Setup");

            this.appendStatementInput("LOOP")
                .appendField("Loop");

            this.setColour("#f39c12");
            this.setMovable(true);
            this.setDeletable(true);
            this.setTooltip("Bloco principal do programa. O Setup executa uma vez e o Loop executa continuamente.");
        }
};


// modules/blocks/time-blocks.js


Blockly.Blocks["time_sleep"] = {
    init() {
        this.appendValueInput("SECONDS")
            .setCheck("Number")
            .appendField("esperar");

        this.appendDummyInput()
            .appendField("segundos");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#f39c12");
        this.setTooltip("Pausa o programa pelo tempo informado em segundos.");
    }
};

const MIHU_CONTROL_COLOUR = "#ffab19";

Blockly.Blocks["mihu_control_wait"] = {
    init() {
        this.appendValueInput("SECONDS")
            .setCheck("Number")
            .appendField("espera");

        this.appendDummyInput()
            .appendField("s");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROL_COLOUR);
        this.setTooltip("Espera a quantidade de segundos informada.");
    }
};

Blockly.Blocks["mihu_control_repeat"] = {
    init() {
        this.appendValueInput("TIMES")
            .setCheck("Number")
            .appendField("repete");

        this.appendDummyInput()
            .appendField("vezes");

        this.appendStatementInput("DO");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROL_COLOUR);
        this.setTooltip("Repete os blocos internos a quantidade de vezes informada.");
    }
};

Blockly.Blocks["mihu_control_forever"] = {
    init() {
        this.appendDummyInput()
            .appendField("repete para sempre");

        this.appendStatementInput("DO");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROL_COLOUR);
        this.setTooltip("Repete os blocos internos continuamente.");
    }
};

Blockly.Blocks["mihu_control_if"] = {
    init() {
        this.appendValueInput("COND")
            .setCheck("Boolean")
            .appendField("se");

        this.appendDummyInput()
            .appendField("então");

        this.appendStatementInput("DO");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROL_COLOUR);
        this.setTooltip("Executa os blocos internos quando a condição for verdadeira.");
    }
};

Blockly.Blocks["mihu_control_if_else"] = {
    init() {
        this.appendValueInput("COND")
            .setCheck("Boolean")
            .appendField("se");

        this.appendDummyInput()
            .appendField("então");

        this.appendStatementInput("DO");

        this.appendDummyInput()
            .appendField("senão,");

        this.appendStatementInput("ELSE");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROL_COLOUR);
        this.setTooltip("Escolhe entre dois grupos de blocos de acordo com a condição.");
    }
};

Blockly.Blocks["mihu_control_wait_until"] = {
    init() {
        this.appendValueInput("COND")
            .setCheck("Boolean")
            .appendField("espera até que");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROL_COLOUR);
        this.setTooltip("Espera até que a condição seja verdadeira.");
    }
};

Blockly.Blocks["mihu_control_repeat_until"] = {
    init() {
        this.appendValueInput("COND")
            .setCheck("Boolean")
            .appendField("até que");

        this.appendDummyInput()
            .appendField("repete");

        this.appendStatementInput("DO");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROL_COLOUR);
        this.setTooltip("Repete os blocos internos até que a condição seja verdadeira.");
    }
};

Blockly.Blocks["mihu_control_stop"] = {
    init() {
        this.appendDummyInput()
            .appendField("parar tudo");
        this.setPreviousStatement(true, null);
        this.setColour(MIHU_CONTROL_COLOUR);
        this.setTooltip("Para a execução do programa.");
    }
};

// =====================================================
// CONTROLE DO BRACO POR CAMERA
// Recebe comandos via USB Serial e controla motores
// =====================================================

Blockly.Blocks["camera_robot_control"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("receber comandos da câmera e controlar braço");

        this.appendDummyInput()
            .appendField("motor vertical")
            .appendField(new Blockly.FieldDropdown([
                ["M1", "M1"],
                ["M2", "M2"],
                ["M3", "M3"],
                ["M4", "M4"]
            ]), "MOTOR_VERTICAL");

        this.appendDummyInput()
            .appendField("motor horizontal")
            .appendField(new Blockly.FieldDropdown([
                ["M1", "M1"],
                ["M2", "M2"],
                ["M3", "M3"],
                ["M4", "M4"]
            ]), "MOTOR_HORIZONTAL");

        this.appendDummyInput()
            .appendField("motor garra")
            .appendField(new Blockly.FieldDropdown([
                ["M1", "M1"],
                ["M2", "M2"],
                ["M3", "M3"],
                ["M4", "M4"]
            ]), "MOTOR_GARRA");

        this.appendValueInput("VEL_MOVIMENTO")
            .setCheck("Number")
            .appendField("velocidade movimento");

        this.appendValueInput("VEL_GARRA")
            .setCheck("Number")
            .appendField("velocidade garra");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B61FF");
        this.setTooltip("Recebe comandos da câmera via USB Serial e controla o braço robótico.");
        this.setHelpUrl("");
    }
};
