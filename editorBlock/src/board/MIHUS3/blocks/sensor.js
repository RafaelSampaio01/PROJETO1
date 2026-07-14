// Blocos verdes da categoria sensor.

const MIHU_SENSOR_COLOUR = "#1fa463";

function mihuPortDropdown() {
    return new Blockly.FieldDropdown([
        ["P1", "P1"],
        ["P2", "P2"],
        ["P3", "P3"],
        ["P4", "P4"]
    ]);
}

function mihuOnOffDropdown(defaultValue = "ON") {
    const options = defaultValue === "OFF"
        ? [["OFF", "OFF"], ["ON", "ON"]]
        : [["ON", "ON"], ["OFF", "OFF"]];
    return new Blockly.FieldDropdown(options);
}

function mihuSensorStatement(type, buildInput) {
    Blockly.Blocks[type] = {
        init() {
            buildInput.call(this);
            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(MIHU_SENSOR_COLOUR);
        }
    };
}

function mihuSensorOutput(type, outputType, buildInput) {
    Blockly.Blocks[type] = {
        init() {
            buildInput.call(this);
            this.setInputsInline(false);
            this.setOutput(true, outputType);
            this.setColour(MIHU_SENSOR_COLOUR);
        }
    };
}

// mihuSensorStatement("mihu_sensor_luminosity", function() {
//     this.appendDummyInput()
//         .appendField("Definir cor luminária")
//         .appendField(mihuPortDropdown(), "PORT")
//         .appendField("cor")
//         .appendField(mihuOnOffDropdown("OFF"), "STATE");
// });

mihuSensorOutput("mihu_sensor_botao", "Boolean", function() {
    this.appendDummyInput()
        .appendField("leia toque")
        .appendField(mihuPortDropdown(), "PORT");
});

// mihuSensorOutput("mihu_sensor_light_read", "Number", function() {
//     this.appendDummyInput()
//         .appendField("Read light sensor")
//         .appendField(mihuPortDropdown(), "PORT");
// });

// mihuSensorStatement("mihu_sensor_light_set", function() {
//     this.appendDummyInput()
//         .appendField("Definir sensor de luz")
//         .appendField(mihuPortDropdown(), "PORT")
//         .appendField(mihuOnOffDropdown("ON"), "STATE");
// });

mihuSensorOutput("mihu_sensor_ultrasonico", "Number", function() {
    this.appendDummyInput()
        .appendField("sensor ultrassônico")
        .appendField(mihuPortDropdown(), "PORT");
});

mihuSensorOutput("mihu_sensor_cor", "String", function() {
    this.appendDummyInput()
        .appendField("sensor de cor")
        .appendField(mihuPortDropdown(), "PORT");
});

// mihuSensorOutput("mihu_sensor_gesture_sensor", "String", function() {
//     this.appendDummyInput()
//         .appendField("Get Gesture Sensor")
//         .appendField(mihuPortDropdown(), "PORT");
// });

// mihuSensorOutput("mihu_sensor_gesture", "String", function() {
//     this.appendDummyInput()
//         .appendField("Gesture")
//         .appendField(new Blockly.FieldDropdown([
//             ["Up", "UP"],
//             ["Down", "DOWN"],
//             ["Left", "LEFT"],
//             ["Right", "RIGHT"]
//         ]), "GESTURE");
// });

// mihuSensorOutput("mihu_sensor_laser_rangefinder", "Number", function() {
//     this.appendDummyInput()
//         .appendField("Get Laser rangefinder")
//         .appendField(mihuPortDropdown(), "PORT");
//     this.appendDummyInput()
//         .appendField("mode")
//         .appendField(new Blockly.FieldDropdown([
//             ["undefined", "undefined"],
//             ["distance", "distance"],
//             ["strength", "strength"]
//         ]), "MODE");
// });

// mihuSensorOutput("mihu_sensor_distance", "Number", function() {
//     this.appendDummyInput()
//         .appendField("Get Distance Sensor")
//         .appendField(mihuPortDropdown(), "PORT");
// });

// mihuSensorOutput("mihu_sensor_color_secs", "Number", function() {
//     this.appendDummyInput()
//         .appendField("obter sensor de cor")
//         .appendField(mihuPortDropdown(), "PORT");
//     this.appendDummyInput()
//         .appendField(new Blockly.FieldDropdown([
//             ["R", "R"],
//             ["G", "G"],
//             ["B", "B"]
//         ]), "COLOR")
//         .appendField("secs");
// });

mihuSensorOutput("mihu_sensor_giroscopio", "Number", function() {
    this.appendDummyInput()
        .appendField("sensor giro")
        .appendField(mihuPortDropdown(), "PORT");
    this.appendDummyInput()
        .appendField("eixo")
        .appendField(new Blockly.FieldDropdown([
            ["rotação", "ROLL_ANGLE"],
            ["inclinação", "PITCH_ANGLE"],
            ["direção", "YAW_ANGLE"]
        ]), "MODE");
});

// mihuSensorStatement("mihu_sensor_ahrs_set", function() {
//     this.appendDummyInput()
//         .appendField("set AHRS")
//         .appendField(mihuPortDropdown(), "PORT")
//         .appendField("mode reset")
//         .appendField(new Blockly.FieldDropdown([
//             ["direct", "DIRECT"],
//             ["all", "ALL"]
//         ]), "DIRECT");
// });

// mihuSensorStatement("mihu_sensor_smarteye_set", function() {
//     this.appendDummyInput()
//         .appendField("Set SmartEye")
//         .appendField(mihuPortDropdown(), "PORT")
//         .appendField("Mode")
//         .appendField(new Blockly.FieldDropdown([
//             ["1", "1"],
//             ["2", "2"],
//             ["3", "3"]
//         ]), "MODE");
//     this.appendValueInput("COLOR")
//         .setCheck("Number")
//         .appendField("Color");
// });

// mihuSensorStatement("mihu_sensor_smarteye_ircode_set", function() {
//     this.appendValueInput("CMD")
//         .setCheck("Number")
//         .appendField("Set SmartEyeIrCode")
//         .appendField(mihuPortDropdown(), "PORT")
//         .appendField("cmd");
// });

// mihuSensorOutput("mihu_sensor_smarteye_record", "String", function() {
//     this.appendDummyInput()
//         .appendField("Get SmartEyeRecord")
//         .appendField(mihuPortDropdown(), "PORT");
// });

// mihuSensorOutput("mihu_sensor_smarteye_dist", "Number", function() {
//     this.appendDummyInput()
//         .appendField("Get SmartEyeDist")
//         .appendField(mihuPortDropdown(), "PORT");
// });

// mihuSensorStatement("mihu_sensor_smarteye_all_led", function() {
//     this.appendDummyInput()
//         .appendField("Set SmartEyeAllLed")
//         .appendField(mihuPortDropdown(), "PORT");
//     this.appendDummyInput()
//         .appendField("color")
//         .appendField(new Blockly.FieldColour("#ff0000"), "COLOR1")
//         .appendField(new Blockly.FieldColour("#ffaa00"), "COLOR2");
// });

// mihuSensorOutput("mihu_sensor_digital_light", "Boolean", function() {
//     this.appendDummyInput()
//         .appendField("ler luz Sensor digital")
//         .appendField(mihuPortDropdown(), "PORT");
// });

// mihuSensorOutput("mihu_sensor_wifi_picture_data", "String", function() {
//     this.appendDummyInput()
//         .appendField("Get Wifi Picture")
//         .appendField("Data")
//         .appendField(new Blockly.FieldDropdown([
//             ["QR-Code ID", "QR_CODE_ID"],
//             ["QRCode", "QRCODE"],
//             ["BarCode", "BARCODE"]
//         ]), "DATA");
// });

// mihuSensorOutput("mihu_sensor_wifi_cam_picture_size", "String", function() {
//     this.appendDummyInput()
//         .appendField("Get Wifi Cam")
//         .appendField("Picture Size")
//         .appendField(new Blockly.FieldDropdown([
//             ["Large", "LARGE"],
//             ["Medium", "MEDIUM"],
//             ["Small", "SMALL"]
//         ]), "SIZE");
// });

// mihuSensorOutput("mihu_sensor_wifi_cam_picture_site", "String", function() {
//     this.appendDummyInput()
//         .appendField("Get Wifi Cam")
//         .appendField("Picture Site")
//         .appendField(new Blockly.FieldDropdown([
//             ["Picture-Up", "PICTURE_UP"],
//             ["Picture-Down", "PICTURE_DOWN"]
//         ]), "SITE");
// });

mihuSensorOutput("mihu_sensor_temperatura", "Number", function() {
    this.appendDummyInput()
        .appendField("sensor de temperatura")
        .appendField(mihuPortDropdown(), "PORT");
});

mihuSensorOutput("mihu_sensor_som", "Number", function() {
    this.appendDummyInput()
        .appendField("sensor de som")
        .appendField(mihuPortDropdown(), "PORT");
});

console.log("Blocos sensor MIHU registrados.");
