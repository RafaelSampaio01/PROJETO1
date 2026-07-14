// Blocos rosados da categoria undefined/display.

const MIHU_DISPLAY_COLOUR = "#f5a5bd";

function mihuDisplayColourDropdown() {
    return new Blockly.FieldDropdown([
        ["PRETO", "BLACK"],
        ["branco", "WHITE"]
    ]);
}

function mihuDisplayStatement(type, buildInput) {
    Blockly.Blocks[type] = {
        init() {
            buildInput.call(this);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(MIHU_DISPLAY_COLOUR);
        }
    };
}

function mihuDisplayOutput(type, outputType, buildInput) {
    Blockly.Blocks[type] = {
        init() {
            buildInput.call(this);
            this.setOutput(true, outputType);
            this.setColour(MIHU_DISPLAY_COLOUR);
        }
    };
}

mihuDisplayStatement("mihu_display_value", function() {
    this.appendValueInput("COL")
        .setCheck("Number")
        .appendField("Valor de exibição X");
    this.appendValueInput("ROW")
        .setCheck("Number")
        .appendField("Y");
    this.appendValueInput("VAR")
        .appendField("valor");
    this.setInputsInline(true);
});

mihuDisplayStatement("mihu_display_string", function() {
    this.appendValueInput("COL")
        .setCheck("Number")
        .appendField("String de exibição X");
    this.appendValueInput("ROW")
        .setCheck("Number")
        .appendField("Y");
    this.appendValueInput("VALUE")
        .appendField("string");
    this.setInputsInline(true);
});

mihuDisplayStatement("mihu_display_lcd_backlight", function() {
    this.appendDummyInput()
        .appendField("Definir LCD")
        .appendField(new Blockly.FieldDropdown([
            ["OFF", "OFF"],
            ["ON", "ON"]
        ]), "STATE");
});

mihuDisplayStatement("mihu_display_point", function() {
    this.appendValueInput("X")
        .setCheck("Number")
        .appendField("Definir ponto X");
    this.appendValueInput("Y")
        .setCheck("Number")
        .appendField("Y");
    this.appendDummyInput()
        .appendField("cor")
        .appendField(mihuDisplayColourDropdown(), "COLOR");
    this.setInputsInline(true);
});

mihuDisplayStatement("mihu_display_line", function() {
    this.appendValueInput("X")
        .setCheck("Number")
        .appendField("Definir linha X");
    this.appendValueInput("Y")
        .setCheck("Number")
        .appendField("Y");
    this.appendValueInput("ANGLE")
        .setCheck("Number")
        .appendField("ângulo");
    this.setInputsInline(true);
        this.appendValueInput("WIDTH")
        .setCheck("Number")
        .appendField("largura");
    this.setInputsInline(true);
});

mihuDisplayStatement("mihu_display_circle", function() {
    this.appendValueInput("X")
        .setCheck("Number")
        .appendField("Definir círculo X");
    this.appendValueInput("Y")
        .setCheck("Number")
        .appendField("Y");
    this.appendValueInput("RADIUS")
        .setCheck("Number")
        .appendField("raio");
    this.appendDummyInput()
        .appendField("cor")
        .appendField(mihuDisplayColourDropdown(), "COLOR");
    this.setInputsInline(true);
});

mihuDisplayStatement("mihu_display_rectangle", function() {
    this.appendValueInput("X")
        .setCheck("Number")
        .appendField("Definir retângulo X");
    this.appendValueInput("Y")
        .setCheck("Number")
        .appendField("Y");
    this.appendValueInput("WIDTH")
        .setCheck("Number")
        .appendField("largura");
    this.setInputsInline(true);
});

mihuDisplayStatement("mihu_display_fill_rectangle", function() {
    this.appendValueInput("X")
        .setCheck("Number")
        .appendField("Preencher Retângulo X");
    this.appendValueInput("Y")
        .setCheck("Number")
        .appendField("Y");
    this.appendValueInput("WIDTH")
        .setCheck("Number")
        .appendField("largura");
    this.setInputsInline(true);
});

mihuDisplayStatement("mihu_display_image", function() {
    this.appendValueInput("X")
        .setCheck("Number")
        .appendField("Definir Imagem de exibição X");
    this.appendValueInput("Y")
        .setCheck("Number")
        .appendField("Y");
    this.appendValueInput("ARQ")
        .setCheck("String")
        .appendField("arquivo");
    this.appendValueInput("SCALE")
        .setCheck("Number")
        .appendField("escala");
    this.setInputsInline(true);
});

console.log("Blocos display MIHU registrados.");
