// Geradores Python dos blocos verdes da categoria sensor.

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function mihuSensorImport() {
    window.mihuAddImport(`from lib.mihuSensor import *`);
}

function q(value) {
    return JSON.stringify(value || "");
}

function sensorArg(field, value) {
    if (field === "PORT" && value) {
        return value;
    }

    return q(value);
}

function sensorCall(name, args) {
    mihuSensorImport();
    return `${name}(${args.join(", ")})\n`;
}

function sensorOutput(type, name, fields) {
    Blockly.Python.forBlock[type] = function(block, generator) {
        generator = generator || Blockly.Python;
        mihuSensorImport();
        const args = fields.map((field) => sensorArg(field, block.getFieldValue(field)));
        return [`${name}(${args.join(", ")})`, generator.ORDER_ATOMIC];
    };
    Blockly.Python[type] = Blockly.Python.forBlock[type];
}

function sensorStatement(type, name, fields) {
    Blockly.Python.forBlock[type] = function(block) {
        const args = fields.map((field) => sensorArg(field, block.getFieldValue(field)));
        return sensorCall(name, args);
    };
    Blockly.Python[type] = Blockly.Python.forBlock[type];
}

sensorStatement("mihu_sensor_luminosity", "setLuminosityColor", ["PORT", "STATE"]);
sensorOutput("mihu_sensor_touch_read", "readTouch", ["PORT"]);
sensorOutput("mihu_sensor_light_read", "readLightSensor", ["PORT"]);
sensorStatement("mihu_sensor_light_set", "setLightSensor", ["PORT", "STATE"]);
sensorOutput("mihu_sensor_ultrasonic", "getUltrasonic", ["PORT"]);
sensorOutput("mihu_sensor_color", "getColorSensor", ["PORT"]);
sensorOutput("mihu_sensor_gesture_sensor", "getGestureSensor", ["PORT"]);
sensorOutput("mihu_sensor_gesture", "getGesture", ["GESTURE"]);
sensorOutput("mihu_sensor_laser_rangefinder", "getLaserRangefinder", ["PORT", "MODE"]);
sensorOutput("mihu_sensor_distance", "getDistanceSensor", ["PORT"]);
sensorOutput("mihu_sensor_color_secs", "getColorSensorSecs", ["PORT", "COLOR"]);
sensorOutput("mihu_sensor_ahrs_get", "getAHRS", ["PORT", "MODE"]);
sensorStatement("mihu_sensor_ahrs_set", "setAHRSReset", ["PORT", "DIRECT"]);
sensorOutput("mihu_sensor_smarteye_record", "getSmartEyeRecord", ["PORT"]);
sensorOutput("mihu_sensor_smarteye_dist", "getSmartEyeDist", ["PORT"]);
sensorOutput("mihu_sensor_digital_light", "readDigitalLightSensor", ["PORT"]);
sensorOutput("mihu_sensor_wifi_picture_data", "getWifiPictureData", ["DATA"]);
sensorOutput("mihu_sensor_wifi_cam_picture_size", "getWifiCamPictureSize", ["SIZE"]);
sensorOutput("mihu_sensor_wifi_cam_picture_site", "getWifiCamPictureSite", ["SITE"]);

Blockly.Python.forBlock["mihu_sensor_smarteye_set"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSensorImport();
    const color = generator.valueToCode(block, "COLOR", generator.ORDER_ATOMIC) || "0";
    return `setSmartEye(${sensorArg("PORT", block.getFieldValue("PORT"))}, ${q(block.getFieldValue("MODE"))}, ${color})\n`;
};
Blockly.Python["mihu_sensor_smarteye_set"] = Blockly.Python.forBlock["mihu_sensor_smarteye_set"];

Blockly.Python.forBlock["mihu_sensor_smarteye_ircode_set"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuSensorImport();
    const cmd = generator.valueToCode(block, "CMD", generator.ORDER_ATOMIC) || "0";
    return `setSmartEyeIrCode(${sensorArg("PORT", block.getFieldValue("PORT"))}, ${cmd})\n`;
};
Blockly.Python["mihu_sensor_smarteye_ircode_set"] = Blockly.Python.forBlock["mihu_sensor_smarteye_ircode_set"];

Blockly.Python.forBlock["mihu_sensor_smarteye_all_led"] = function(block) {
    mihuSensorImport();
    return `setSmartEyeAllLed(${sensorArg("PORT", block.getFieldValue("PORT"))}, ${q(block.getFieldValue("COLOR1"))}, ${q(block.getFieldValue("COLOR2"))})\n`;
};
Blockly.Python["mihu_sensor_smarteye_all_led"] = Blockly.Python.forBlock["mihu_sensor_smarteye_all_led"];

console.log("Generators sensor MIHU registrados.");
