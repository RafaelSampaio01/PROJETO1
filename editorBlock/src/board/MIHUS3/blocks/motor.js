// Blocos cinza da categoria motor.

const MIHU_MOTOR_COLOUR = "#6f7f8f";

function mihuMotorDropdown() {
    return new Blockly.FieldDropdown([
        ["M1", "M1"],
        ["M2", "M2"],
        ["M3", "M3"],
        ["M4", "M4"]
    ]);
}

Blockly.Blocks["mihu_motor_interface"] = {
    init() {
        this.appendValueInput("POWER")
            .setCheck("Number")
            .appendField("interface do motor")
            .appendField(mihuMotorDropdown(), "MOTOR")
            .appendField("potência");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_MOTOR_COLOUR);
        this.setTooltip("Controla o motor selecionado com a potência informada.");
    }
};

Blockly.Blocks["mihu_motor_set_code"] = {
    init() {
        this.appendDummyInput()
            .appendField("definir código do motor")
            .appendField(mihuMotorDropdown(), "MOTOR");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_MOTOR_COLOUR);
        this.setTooltip("Define/prepara o código do motor selecionado.");
    }
};

Blockly.Blocks["mihu_motor_get_code"] = {
    init() {
        this.appendDummyInput()
            .appendField("obter código do motor")
            .appendField(mihuMotorDropdown(), "MOTOR");

        this.setOutput(true, "Number");
        this.setColour(MIHU_MOTOR_COLOUR);
        this.setTooltip("Obtém o código do motor selecionado.");
    }
};

Blockly.Blocks["mihu_motor_wait_angle"] = {
    init() {
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField("definir espera do motor para o ângulo")
            .appendField(mihuMotorDropdown(), "MOTOR")
            .appendField("Rapidez");

        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField("ângulo");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_MOTOR_COLOUR);
        this.setTooltip("Move o motor para um ângulo usando a rapidez informada.");
    }
};

Blockly.Blocks["mihu_motor_servo_angle"] = {
    init() {
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField("Definir ângulo do motor")
            .appendField(mihuMotorDropdown(), "MOTOR")
            .appendField("Rapidez");

        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField("ângulo");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_MOTOR_COLOUR);
        this.setTooltip("Move o servo para um ângulo usando a rapidez informada.");
    }
};

console.log("Blocos motor MIHU registrados.");
