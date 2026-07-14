// src/board/MIHUS3/generators/pins-generators.js

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function createPinGenerator(blockName, fallbackValue) {
    Blockly.Python.forBlock[blockName] = function (block) {
        const pin = block.getFieldValue("PIN") || fallbackValue;
        return [pin, Blockly.Python.ORDER_ATOMIC];
    };

    Blockly.Python[blockName] = Blockly.Python.forBlock[blockName];
}

createPinGenerator("pins_digital", "0");
createPinGenerator("pins_analog", "1");
createPinGenerator("pins_pwm", "0");
createPinGenerator("pins_uart", "43");
createPinGenerator("pins_rtc", "1");
createPinGenerator("pins_touch", "1");

Blockly.Python.forBlock["inout_highlow"] = function (block) {
    const status = block.getFieldValue("STATUS") || "1";
    return [status, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python["inout_highlow"] =
    Blockly.Python.forBlock["inout_highlow"];

console.log("Generators de pinos MIHU registrados.");