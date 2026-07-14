// Blocos verdes da categoria Operadores.

const MIHU_OPERATOR_COLOUR = "#34a853";

function mihuSpacer(width) {
    const FieldLabel = Blockly.FieldLabelSerializable || Blockly.FieldLabel;
    return new FieldLabel(" ".repeat(width));
}

Blockly.Blocks["mihu_operator_arithmetic"] = {
    init() {
        this.appendValueInput("A")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField(mihuSpacer(1))
            .appendField(new Blockly.FieldDropdown([
                ["+", "ADD"],
                ["-", "MINUS"],
                ["x", "MULTIPLY"],
                ["/", "DIVIDE"]
            ]), "OP")
            .appendField(mihuSpacer(1));
        this.appendValueInput("B")
            .setCheck("Number");

        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Calcula uma operação matemática.");
    }
};

Blockly.Blocks["mihu_operator_random"] = {
    init() {
        this.appendValueInput("FROM")
            .setCheck("Number")
            .appendField("um valor ao acaso entre");
        this.appendValueInput("TO")
            .setCheck("Number")
            .appendField(mihuSpacer(1))
            .appendField("e")
            .appendField(mihuSpacer(1));

        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Sorteia um número inteiro entre dois valores.");
    }
};

Blockly.Blocks["mihu_operator_compare"] = {
    init() {
        this.appendValueInput("A");
        this.appendDummyInput()
            .appendField(mihuSpacer(1))
            .appendField(new Blockly.FieldDropdown([
                ["<", "LT"],
                ["=", "EQ"],
                ["≠", "NEQ"],
                ["≤", "LTE"],
                ["≥", "GTE"],
                [">", "GT"]
            ]), "OP")
            .appendField(mihuSpacer(1));
        this.appendValueInput("B");

        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Compara dois valores.");
    }
};

Blockly.Blocks["mihu_operator_boolean"] = {
    init() {
        this.appendValueInput("A")
            .setCheck("Boolean");
        this.appendDummyInput()
            .appendField(mihuSpacer(1))
            .appendField(new Blockly.FieldDropdown([
                ["e", "AND"],
                ["ou", "OR"]
            ]), "OP")
            .appendField(mihuSpacer(1));
        this.appendValueInput("B")
            .setCheck("Boolean");

        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Combina duas condições.");
    }
};

Blockly.Blocks["mihu_operator_not"] = {
    init() {
        this.appendValueInput("VALUE")
            .setCheck("Boolean")
            .appendField("é falso que")
            .appendField(mihuSpacer(1));

        this.setOutput(true, "Boolean");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Inverte uma condição.");
    }
};

Blockly.Blocks["mihu_operator_join"] = {
    init() {
        this.appendValueInput("A")
            .appendField("a junção de")
            .appendField(mihuSpacer(1));
        this.appendValueInput("B")
            .appendField(mihuSpacer(1))
            .appendField("com")
            .appendField(mihuSpacer(1));

        this.setInputsInline(true);
        this.setOutput(true, "String");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Junta dois textos.");
    }
};

Blockly.Blocks["mihu_operator_letter_of"] = {
    init() {
        this.appendValueInput("INDEX")
            .setCheck("Number")
            .appendField("o caractere")
            .appendField(mihuSpacer(1));
        this.appendValueInput("TEXT")
            .appendField(mihuSpacer(1))
            .appendField("de")
            .appendField(mihuSpacer(1));

        this.setInputsInline(true);
        this.setOutput(true, "String");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Pega um caractere de um texto. A primeira posição é 1.");
    }
};

Blockly.Blocks["mihu_operator_length"] = {
    init() {
        this.appendValueInput("TEXT")
            .appendField("o comprimento de")
            .appendField(mihuSpacer(1));

        this.setOutput(true, "Number");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Conta quantos caracteres existem no texto.");
    }
};

Blockly.Blocks["mihu_operator_contains"] = {
    init() {
        this.appendValueInput("TEXT");
        this.appendValueInput("SUBTEXT")
            .appendField(mihuSpacer(1))
            .appendField("contém")
            .appendField(mihuSpacer(1));

        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Verifica se um texto contém outro.");
    }
};

Blockly.Blocks["mihu_operator_mod"] = {
    init() {
        this.appendValueInput("A")
            .setCheck("Number")
            .appendField("o resto de")
            .appendField(mihuSpacer(1));
        this.appendValueInput("B")
            .setCheck("Number")
            .appendField(mihuSpacer(1))
            .appendField("a dividir por")
            .appendField(mihuSpacer(1));

        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Retorna o resto da divisão.");
    }
};

Blockly.Blocks["mihu_operator_round"] = {
    init() {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("o arredondamento de")
            .appendField(mihuSpacer(1));

        this.setOutput(true, "Number");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Arredonda um número.");
    }
};

Blockly.Blocks["mihu_operator_abs"] = {
    init() {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("o valor absoluto de")
            .appendField(mihuSpacer(1));

        this.setOutput(true, "Number");
        this.setColour(MIHU_OPERATOR_COLOUR);
        this.setTooltip("Retorna o valor absoluto de um número.");
    }
};

console.log("Blocos operadores MIHU registrados.");
