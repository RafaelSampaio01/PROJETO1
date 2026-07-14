
// src/board/MIHUS3/blocks/rgb.js

// =====================================================
// LED RGB - LIMPAR
// =====================================================

Blockly.Blocks["rgb_clear"] = {
    init() {
        this.appendDummyInput()
            .appendField("Apagar todos os LEDs RGB");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Apaga todos os LEDs RGB da placa.");
    }
};

// =====================================================
// LED RGB - LED INDIVIDUAL
// =====================================================

Blockly.Blocks["rgb_set"] = {
    init() {
        this.appendDummyInput()
            .appendField("Definir LED RGB");

        this.appendValueInput("LED")
            .setCheck("Number")
            .appendField("led");

        this.appendValueInput("R")
            .setCheck("Number")
            .appendField("vermelho");

        this.appendValueInput("G")
            .setCheck("Number")
            .appendField("verde");

        this.appendValueInput("B")
            .setCheck("Number")
            .appendField("azul");

        this.appendValueInput("BRIGHTNESS")
            .setCheck("Number")
            .appendField("brilho");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Define a cor de um LED RGB individual. LED: 0 a 29. Brilho: 0 a 60.");
    }
};

// =====================================================
// LED RGB - LADO ESQUERDO
// =====================================================

Blockly.Blocks["rgb_left"] = {
    init() {
        this.appendDummyInput()
            .appendField("Definir LEDs RGB do lado esquerdo");

        this.appendValueInput("R")
            .setCheck("Number")
            .appendField("vermelho");

        this.appendValueInput("G")
            .setCheck("Number")
            .appendField("verde");

        this.appendValueInput("B")
            .setCheck("Number")
            .appendField("azul");

        this.appendValueInput("BRIGHTNESS")
            .setCheck("Number")
            .appendField("brilho");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Define a cor dos LEDs RGB do lado esquerdo.");
    }
};

// =====================================================
// LED RGB - LADO DIREITO
// =====================================================

Blockly.Blocks["rgb_right"] = {
    init() {
        this.appendDummyInput()
            .appendField("Definir LEDs RGB do lado direito");

        this.appendValueInput("R")
            .setCheck("Number")
            .appendField("vermelho");

        this.appendValueInput("G")
            .setCheck("Number")
            .appendField("verde");

        this.appendValueInput("B")
            .setCheck("Number")
            .appendField("azul");

        this.appendValueInput("BRIGHTNESS")
            .setCheck("Number")
            .appendField("brilho");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Define a cor dos LEDs RGB do lado direito.");
    }
};

// =====================================================
// LED RGB - INTERVALO
// =====================================================

Blockly.Blocks["rgb_range"] = {
    init() {
        this.appendDummyInput()
            .appendField("Definir intervalo de LEDs RGB");

        this.appendValueInput("START")
            .setCheck("Number")
            .appendField("de");

        this.appendValueInput("END")
            .setCheck("Number")
            .appendField("até");

        this.appendValueInput("R")
            .setCheck("Number")
            .appendField("vermelho");

        this.appendValueInput("G")
            .setCheck("Number")
            .appendField("verde");

        this.appendValueInput("B")
            .setCheck("Number")
            .appendField("azul");

        this.appendValueInput("BRIGHTNESS")
            .setCheck("Number")
            .appendField("brilho");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Define a cor de um intervalo de LEDs RGB.");
    }
};

// =====================================================
// LED RGB - SIMÉTRICO
// =====================================================

Blockly.Blocks["rgb_sym"] = {
    init() {
        this.appendDummyInput()
            .appendField("Definir LED RGB simétrico");

        this.appendValueInput("LED")
            .setCheck("Number")
            .appendField("led");

        this.appendValueInput("R")
            .setCheck("Number")
            .appendField("vermelho");

        this.appendValueInput("G")
            .setCheck("Number")
            .appendField("verde");

        this.appendValueInput("B")
            .setCheck("Number")
            .appendField("azul");

        this.appendValueInput("BRIGHTNESS")
            .setCheck("Number")
            .appendField("brilho");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Acende um LED e seu correspondente simétrico.");
    }
};

// =====================================================
// LED RGB - REFLETÂNCIA
// =====================================================

Blockly.Blocks["rgb_reflectance"] = {
    init() {
        this.appendDummyInput()
            .appendField("Mostrar refletância nos LEDs RGB");

        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("valor");

        this.appendValueInput("BRIGHTNESS")
            .setCheck("Number")
            .appendField("brilho");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Mostra um valor de refletância de 0 a 100 nos LEDs RGB.");
    }
};

// =====================================================
// LED RGB - ULTRASSÔNICO
// =====================================================

Blockly.Blocks["rgb_ultrasonic"] = {
    init() {
        this.appendDummyInput()
            .appendField("Mostrar distância nos LEDs RGB");

        this.appendValueInput("DISTANCE")
            .setCheck("Number")
            .appendField("distância cm");

        this.appendValueInput("BRIGHTNESS")
            .setCheck("Number")
            .appendField("brilho");

        this.appendValueInput("MIN")
            .setCheck("Number")
            .appendField("mínimo cm");

        this.appendValueInput("MAX")
            .setCheck("Number")
            .appendField("máximo cm");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Mostra visualmente a distância medida por sensor ultrassônico nos LEDs RGB.");
    }
};


// =====================================================
// LED RGB - ACENDER TODOS COM PALETA
// =====================================================

Blockly.Blocks["rgb_all_palette"] = {
    init() {
        this.appendDummyInput()
            .appendField("Acender todos os LEDs")
            .appendField(new Blockly.FieldDropdown([
                ["vermelho", "255,0,0"],
                ["verde", "0,255,0"],
                ["azul", "0,0,255"],
                ["amarelo", "255,255,0"],
                ["ciano", "0,255,255"],
                ["magenta", "255,0,255"],
                ["branco", "255,255,255"],
                ["laranja", "255,80,0"],
                ["roxo", "120,0,255"],
                ["apagado", "0,0,0"]
            ]), "COLOR");

        this.appendValueInput("BRIGHTNESS")
            .setCheck("Number")
            .appendField("brilho");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff5757");
        this.setTooltip("Acende todos os LEDs RGB usando uma cor da paleta e o brilho informado.");
    }
};

console.log("Blocos LED RGB MIHU registrados.");
