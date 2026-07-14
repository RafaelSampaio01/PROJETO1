// Blocos laranja da categoria Variáveis.

const MIHU_VARIABLE_COLOUR = "#ff7f1a";

function mihuVariableField() {
    return new Blockly.FieldVariable("variável");
}

Blockly.Blocks["mihu_variable_get"] = {
    init() {
        this.appendDummyInput()
            .appendField(mihuVariableField(), "VAR");

        this.setOutput(true, null);
        this.setColour(MIHU_VARIABLE_COLOUR);
        this.setTooltip("Valor da variável selecionada.");
    }
};

Blockly.Blocks["mihu_variable_set"] = {
    init() {
        this.appendValueInput("VALUE")
            .appendField("altera")
            .appendField(mihuVariableField(), "VAR")
            .appendField("para");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_VARIABLE_COLOUR);
        this.setTooltip("Define o valor da variável.");
    }
};

Blockly.Blocks["mihu_variable_change"] = {
    init() {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("adiciona a")
            .appendField(mihuVariableField(), "VAR")
            .appendField("o valor");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_VARIABLE_COLOUR);
        this.setTooltip("Soma um valor à variável.");
    }
};

Blockly.Blocks["mihu_variable_show"] = {
    init() {
        this.appendDummyInput()
            .appendField("mostra a variável")
            .appendField(mihuVariableField(), "VAR");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_VARIABLE_COLOUR);
        this.setTooltip("Mostra a variável. No código Python, este bloco imprime o valor no terminal.");
    }
};

Blockly.Blocks["mihu_variable_hide"] = {
    init() {
        this.appendDummyInput()
            .appendField("esconde a variável")
            .appendField(mihuVariableField(), "VAR");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_VARIABLE_COLOUR);
        this.setTooltip("Esconde a variável. No código Python, este bloco não gera instrução.");
    }
};

console.log("Blocos variáveis MIHU registrados.");
