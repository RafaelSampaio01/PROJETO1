// Geradores Python dos blocos cinza da categoria motor.

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function mihuMotorImport() {
    window.mihuAddImport(`from lib.mihuMotor import *`);
}

function mihuMotorValue(generator, block, inputName, fallback) {
    return generator.valueToCode(block, inputName, generator.ORDER_ATOMIC) || fallback;
}

function mihuMotorName(block) {
    return block.getFieldValue("MOTOR") || "M1";
}

Blockly.Python.forBlock["mihu_motor_interface"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuMotorImport();

    const motor = mihuMotorName(block);
    const power = mihuMotorValue(generator, block, "POWER", "50");

    return `setMotor(${motor}, ${power})\n`;
};

Blockly.Python["mihu_motor_interface"] =
    Blockly.Python.forBlock["mihu_motor_interface"];

Blockly.Python.forBlock["mihu_motor_set_code"] = function(block) {
    mihuMotorImport();

    const motor = mihuMotorName(block);

    return `setMotorCode(${motor})\n`;
};

Blockly.Python["mihu_motor_set_code"] =
    Blockly.Python.forBlock["mihu_motor_set_code"];

Blockly.Python.forBlock["mihu_motor_get_code"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuMotorImport();

    const motor = mihuMotorName(block);

    return [`getMotorCode(${motor})`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_motor_get_code"] =
    Blockly.Python.forBlock["mihu_motor_get_code"];

Blockly.Python.forBlock["mihu_motor_wait_angle"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuMotorImport();

    const motor = mihuMotorName(block);
    const speed = mihuMotorValue(generator, block, "SPEED", "0");
    const angle = mihuMotorValue(generator, block, "ANGLE", "0");

    return `setMotorAngle(${motor}, ${speed}, ${angle})\n`;
};

Blockly.Python["mihu_motor_wait_angle"] =
    Blockly.Python.forBlock["mihu_motor_wait_angle"];

Blockly.Python.forBlock["mihu_motor_servo_angle"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuMotorImport();

    const motor = mihuMotorName(block);
    const speed = mihuMotorValue(generator, block, "SPEED", "0");
    const angle = mihuMotorValue(generator, block, "ANGLE", "0");

    return `setServoAngle(${motor}, ${speed}, ${angle})\n`;
};

Blockly.Python["mihu_motor_servo_angle"] =
    Blockly.Python.forBlock["mihu_motor_servo_angle"];

console.log("Generators motor MIHU registrados.");
