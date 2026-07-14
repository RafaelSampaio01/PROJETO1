// Geradores Python dos blocos rosados da categoria display/undefined.

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function mihuDisplayImport() {
    Blockly.Python.definitions_["import_mihu_display"] = `
try:
    from Lib.mihuDisplay import *
except:
    from lib.mihuDisplay import *
`;
}

function displayValue(generator, block, inputName, fallback) {
    return generator.valueToCode(block, inputName, generator.ORDER_ATOMIC) || fallback;
}

function displayOutput(type, callName) {
    Blockly.Python.forBlock[type] = function(block, generator) {
        generator = generator || Blockly.Python;
        mihuDisplayImport();
        return [`${callName}()`, generator.ORDER_ATOMIC];
    };
    Blockly.Python[type] = Blockly.Python.forBlock[type];
}

displayOutput("mihu_display_touch", "readTouchScreen");
displayOutput("mihu_display_touch_x", "readTouchScreenX");
displayOutput("mihu_display_touch_y", "readTouchScreenY");

Blockly.Python.forBlock["mihu_display_touch_line_var"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuDisplayImport();
    const col = displayValue(generator, block, "COL", "1");
    const row = displayValue(generator, block, "ROW", "1");
    const variable = displayValue(generator, block, "VAR", "0");
    return `setTouchLineVar(${col}, ${row}, ${variable})\n`;
};
Blockly.Python["mihu_display_touch_line_var"] = Blockly.Python.forBlock["mihu_display_touch_line_var"];

Blockly.Python.forBlock["mihu_display_string_line"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuDisplayImport();
    const col = displayValue(generator, block, "COL", "1");
    const row = displayValue(generator, block, "ROW", "1");
    const value = displayValue(generator, block, "VALUE", "\"\"");
    return `displayStringLine(${col}, ${row}, ${value})\n`;
};
Blockly.Python["mihu_display_string_line"] = Blockly.Python.forBlock["mihu_display_string_line"];

Blockly.Python.forBlock["mihu_display_lcd_backlight"] = function(block) {
    mihuDisplayImport();
    return `setLcdBacklight(${JSON.stringify(block.getFieldValue("STATE"))})\n`;
};
Blockly.Python["mihu_display_lcd_backlight"] = Blockly.Python.forBlock["mihu_display_lcd_backlight"];

Blockly.Python.forBlock["mihu_display_lcd_clear"] = function(block) {
    mihuDisplayImport();
    return `clearLcd(${JSON.stringify(block.getFieldValue("COLOR"))})\n`;
};
Blockly.Python["mihu_display_lcd_clear"] = Blockly.Python.forBlock["mihu_display_lcd_clear"];

Blockly.Python.forBlock["mihu_display_point"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuDisplayImport();
    const x = displayValue(generator, block, "X", "10");
    const y = displayValue(generator, block, "Y", "10");
    return `drawPoint(${x}, ${y}, ${JSON.stringify(block.getFieldValue("COLOR"))})\n`;
};
Blockly.Python["mihu_display_point"] = Blockly.Python.forBlock["mihu_display_point"];

Blockly.Python.forBlock["mihu_display_line"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuDisplayImport();
    const x = displayValue(generator, block, "X", "1");
    const y = displayValue(generator, block, "Y", "15");
    const angle = displayValue(generator, block, "ANGLE", "10");
    return `drawLineAngle(${x}, ${y}, ${angle})\n`;
};
Blockly.Python["mihu_display_line"] = Blockly.Python.forBlock["mihu_display_line"];

Blockly.Python.forBlock["mihu_display_circle"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuDisplayImport();
    const x = displayValue(generator, block, "X", "10");
    const y = displayValue(generator, block, "Y", "10");
    const radius = displayValue(generator, block, "RADIUS", "10");
    return `drawCircle(${x}, ${y}, ${radius}, ${JSON.stringify(block.getFieldValue("COLOR"))})\n`;
};
Blockly.Python["mihu_display_circle"] = Blockly.Python.forBlock["mihu_display_circle"];

Blockly.Python.forBlock["mihu_display_rectangle"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuDisplayImport();
    const x = displayValue(generator, block, "X", "10");
    const y = displayValue(generator, block, "Y", "10");
    const width = displayValue(generator, block, "WIDTH", "50");
    return `drawRectangle(${x}, ${y}, ${width})\n`;
};
Blockly.Python["mihu_display_rectangle"] = Blockly.Python.forBlock["mihu_display_rectangle"];

Blockly.Python.forBlock["mihu_display_fill_rectangle"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuDisplayImport();
    const x = displayValue(generator, block, "X", "10");
    const y = displayValue(generator, block, "Y", "10");
    const width = displayValue(generator, block, "WIDTH", "50");
    return `fillRectangle(${x}, ${y}, ${width})\n`;
};
Blockly.Python["mihu_display_fill_rectangle"] = Blockly.Python.forBlock["mihu_display_fill_rectangle"];

Blockly.Python.forBlock["mihu_display_image"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuDisplayImport();
    const x = displayValue(generator, block, "X", "10");
    const y = displayValue(generator, block, "Y", "10");
    return `displayImage(${x}, ${y})\n`;
};
Blockly.Python["mihu_display_image"] = Blockly.Python.forBlock["mihu_display_image"];

console.log("Generators display MIHU registrados.");
