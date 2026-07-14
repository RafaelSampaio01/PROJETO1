// =====================================================
// MIHU OLED - Blocos fáceis para alunos
// Caminho sugerido: src/board/MIHUS3/blocks/mihuOledFacil.js
// Biblioteca alvo: lib/mihuOled/mihuOled.py
// Ideia: poucos blocos, compactos e diretos.
// =====================================================

const MIHU_OLED_FACIL_COLOR_SCREEN = "#D97706";
const MIHU_OLED_FACIL_COLOR_TEXT = "#2E8B57";
const MIHU_OLED_FACIL_COLOR_DRAW = "#4A90E2";

const MIHU_OLED_FACIL_FONTS = [
    ["atual", "NONE"],
    ["padrão 8x8", "DEFAULT"],
    ["pequena", "font6"],
    ["média", "font10"],
    ["grande", "font16b"],
    ["mont 12", "mont12h"],
    ["mont 18", "mont18h"],
    ["free 20", "freesans20"]
];

Blockly.Blocks["mihu_oled_facil_limpar"] = {
    init() {
        this.appendDummyInput()
            .appendField("OLED limpar")
            .appendField(new Blockly.FieldDropdown([
                ["tela preta", "0"],
                ["tela branca", "1"]
            ]), "COLOR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_DISPLAY_COLOUR);
        this.setTooltip("Limpa a tela inteira. Use fora do loop quando possível para evitar piscar.");
    }
};

Blockly.Blocks["mihu_oled_facil_limpar_area"] = {
    init() {
        this.appendDummyInput()
            .appendField("OLED limpar área")
            .appendField("X")
            .appendField(new Blockly.FieldNumber(0, 0, 127, 1), "X")
            .appendField("Y")
            .appendField(new Blockly.FieldNumber(0, 0, 63, 1), "Y")
            .appendField("largura")
            .appendField(new Blockly.FieldNumber(40, 1, 128, 1), "W")
            .appendField("altura")
            .appendField(new Blockly.FieldNumber(12, 1, 64, 1), "H");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_DISPLAY_COLOUR);
        this.setTooltip("Apaga somente uma região da tela.");
    }
};

Blockly.Blocks["mihu_oled_facil_escrever"] = {
    init() {
        this.appendValueInput("TEXT")
            .setCheck(null)
            .appendField("OLED escrever");
        this.appendDummyInput()
            .appendField("X")
            .appendField(new Blockly.FieldNumber(0, 0, 127, 1), "X")
            .appendField("Y")
            .appendField(new Blockly.FieldNumber(0, 0, 63, 1), "Y")
            .appendField("fonte")
            .appendField(new Blockly.FieldDropdown(MIHU_OLED_FACIL_FONTS), "FONT");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_DISPLAY_COLOUR);
        this.setTooltip("Escreve texto, número ou leitura de sensor. Se o valor mudar, a área antiga é apagada automaticamente sem piscar a tela inteira.");
    }
};

Blockly.Blocks["mihu_oled_facil_centralizar"] = {
    init() {
        this.appendValueInput("TEXT")
            .setCheck(null)
            .appendField("OLED centralizar");
        this.appendDummyInput()
            .appendField("Y")
            .appendField(new Blockly.FieldNumber(0, 0, 63, 1), "Y")
            .appendField("fonte")
            .appendField(new Blockly.FieldDropdown(MIHU_OLED_FACIL_FONTS), "FONT");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_DISPLAY_COLOUR);
        this.setTooltip("Centraliza texto, número ou leitura de sensor na horizontal.");
    }
};

Blockly.Blocks["mihu_oled_facil_simbolo"] = {
    init() {
        this.appendDummyInput()
            .appendField("OLED símbolo")
            .appendField(new Blockly.FieldDropdown([
                ["check", "check"],
                ["X", "cross"],
                ["seta cima", "arrowUp"],
                ["seta baixo", "arrowDown"],
                ["seta esquerda", "arrowLeft"],
                ["seta direita", "arrowRight"]
            ]), "SYMBOL")
            .appendField("X")
            .appendField(new Blockly.FieldNumber(60, 0, 127, 1), "X")
            .appendField("Y")
            .appendField(new Blockly.FieldNumber(28, 0, 63, 1), "Y")
            .appendField("tamanho")
            .appendField(new Blockly.FieldNumber(12, 4, 32, 1), "SIZE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_DISPLAY_COLOUR);
        this.setTooltip("Desenha símbolos prontos.");
    }
};
