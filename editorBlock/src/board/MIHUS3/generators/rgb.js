// src/board/MIHUS3/generators/rgb.js

// src/board/MIHUS3/generators/rgb.js

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

// =====================================================
// HELPERS GLOBAIS MIHU
// =====================================================

if (typeof window.mihuAddImport !== "function") {
    window.mihuAddImport = function(importLine) {
        window.MIHU_IMPORTS = window.MIHU_IMPORTS || new Set();
        window.MIHU_IMPORTS.add(importLine);
    };
}

function mihuValue(generator, block, name, fallback) {
    return generator.valueToCode(block, name, generator.ORDER_ATOMIC) || fallback;
}

function mihuSetupRGB() {
    window.mihuAddImport("from lib.mihuRGB.mihuRGB import *");
}

// =====================================================
// LED RGB - LIMPAR
// =====================================================

Blockly.Python.forBlock["rgb_clear"] = function(block, generator) {
    mihuSetupRGB();

    return "mihuRGBclear()\n";
};

Blockly.Python["rgb_clear"] =
    Blockly.Python.forBlock["rgb_clear"];

// =====================================================
// LED RGB - LED INDIVIDUAL
// =====================================================

Blockly.Python.forBlock["rgb_set"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSetupRGB();

    const led = mihuValue(generator, block, "LED", "0");
    const r = mihuValue(generator, block, "R", "255");
    const g = mihuValue(generator, block, "G", "0");
    const b = mihuValue(generator, block, "B", "0");
    const brilho = mihuValue(generator, block, "BRIGHTNESS", "60");

    return `mihuRGBset(${led}, ${r}, ${g}, ${b}, ${brilho})\n`;
};

Blockly.Python["rgb_set"] =
    Blockly.Python.forBlock["rgb_set"];

// =====================================================
// LED RGB - LADO ESQUERDO
// =====================================================

Blockly.Python.forBlock["rgb_left"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSetupRGB();

    const r = mihuValue(generator, block, "R", "255");
    const g = mihuValue(generator, block, "G", "0");
    const b = mihuValue(generator, block, "B", "0");
    const brilho = mihuValue(generator, block, "BRIGHTNESS", "60");

    return `mihuRGBleft(${r}, ${g}, ${b}, ${brilho})\n`;
};

Blockly.Python["rgb_left"] =
    Blockly.Python.forBlock["rgb_left"];

// =====================================================
// LED RGB - LADO DIREITO
// =====================================================

Blockly.Python.forBlock["rgb_right"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSetupRGB();

    const r = mihuValue(generator, block, "R", "0");
    const g = mihuValue(generator, block, "0");
    const b = mihuValue(generator, block, "B", "255");
    const brilho = mihuValue(generator, block, "BRIGHTNESS", "60");

    return `mihuRGBright(${r}, ${g}, ${b}, ${brilho})\n`;
};

Blockly.Python["rgb_right"] =
    Blockly.Python.forBlock["rgb_right"];

// =====================================================
// LED RGB - INTERVALO
// =====================================================

Blockly.Python.forBlock["rgb_range"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSetupRGB();

    const start = mihuValue(generator, block, "START", "0");
    const end = mihuValue(generator, block, "END", "5");
    const r = mihuValue(generator, block, "R", "255");
    const g = mihuValue(generator, block, "G", "255");
    const b = mihuValue(generator, block, "B", "255");
    const brilho = mihuValue(generator, block, "BRIGHTNESS", "60");

    return `mihuRGBrange(${start}, ${end}, ${r}, ${g}, ${b}, ${brilho})\n`;
};

Blockly.Python["rgb_range"] =
    Blockly.Python.forBlock["rgb_range"];

// =====================================================
// LED RGB - SIMÉTRICO
// =====================================================

Blockly.Python.forBlock["rgb_sym"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSetupRGB();

    const led = mihuValue(generator, block, "LED", "0");
    const r = mihuValue(generator, block, "R", "255");
    const g = mihuValue(generator, block, "G", "255");
    const b = mihuValue(generator, block, "B", "255");
    const brilho = mihuValue(generator, block, "BRIGHTNESS", "60");

    return `mihuRGBsym(${led}, ${r}, ${g}, ${b}, ${brilho})\n`;
};

Blockly.Python["rgb_sym"] =
    Blockly.Python.forBlock["rgb_sym"];

// =====================================================
// LED RGB - REFLETÂNCIA
// =====================================================

Blockly.Python.forBlock["rgb_reflectance"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSetupRGB();

    const value = mihuValue(generator, block, "VALUE", "0");
    const brilho = mihuValue(generator, block, "BRIGHTNESS", "60");

    return `refletancia_leds(${value}, brilho=${brilho})\n`;
};

Blockly.Python["rgb_reflectance"] =
    Blockly.Python.forBlock["rgb_reflectance"];

// =====================================================
// LED RGB - ULTRASSÔNICO
// =====================================================

Blockly.Python.forBlock["rgb_ultrasonic"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSetupRGB();

    const distance = mihuValue(generator, block, "DISTANCE", "0");
    const brilho = mihuValue(generator, block, "BRIGHTNESS", "60");
    const minCm = mihuValue(generator, block, "MIN", "3");
    const maxCm = mihuValue(generator, block, "MAX", "100");

    return `ultrassonico_leds(${distance}, brilho=${brilho}, min_cm=${minCm}, max_cm=${maxCm})\n`;
};

Blockly.Python["rgb_ultrasonic"] =
    Blockly.Python.forBlock["rgb_ultrasonic"];


    // =====================================================
// LED RGB - ACENDER TODOS COM PALETA
// Gera:
// from lib.mihuRGB.mihuRGB import *
// mihuRGBrange(0, 29, r, g, b, brilho)
// =====================================================

Blockly.Python.forBlock["rgb_all_palette"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupRGB();

    const color = block.getFieldValue("COLOR") || "255,0,0";
    const brightness = mihuValue(generator, block, "BRIGHTNESS", "60");

    const rgb = color.split(",");
    const r = rgb[0] || "255";
    const g = rgb[1] || "0";
    const b = rgb[2] || "0";

    return `mihuRGBrange(0, 29, ${r}, ${g}, ${b}, ${brightness})\n`;
};

Blockly.Python["rgb_all_palette"] =
    Blockly.Python.forBlock["rgb_all_palette"];
    
console.log("Generators LED RGB MIHU registrados.");