// src/board/MIHUS3/blocks/pins-blocks.js

function getMihuBoardProfile() {
    if (window.MIHU_BOARD_PROFILE) {
        return window.MIHU_BOARD_PROFILE;
    }

    console.warn("MIHU_BOARD_PROFILE não encontrado. Usando fallback.");

    return {
        pins: {},
        getPinInfo() {
            return null;
        },
        getDigitalPinOptions() {
            return [["GPIO0", "0"]];
        },
        getAnalogPinOptions() {
            return [["A1", "1"]];
        },
        getPwmPinOptions() {
            return [["GPIO0", "0"]];
        },
        getUartPinOptions() {
            return [["UART_TX", "43"], ["UART_RX", "44"]];
        },
        getRtcPinOptions() {
            return [["RTC_GPIO1", "1"]];
        },
        getTouchPinOptions() {
            return [["TOUCH1", "1"]];
        }
    };
}

function getMihuColor(family) {
    const colors = window.MIHU_PIN_COLORS || {};
    return colors[family] || "#4A90E2";
}

function formatSharedWarning(pinInfo) {
    if (!pinInfo || !pinInfo.sharedWith || pinInfo.sharedWith.length === 0) {
        return "";
    }

    const nomes = {
        digital: "Entrada/Saída digital",
        analog: "ADC / Analógico",
        uart: "UART / Serial",
        rtc: "RTC",
        touch: "Touch",
        boot: "Configuração de Boot",
        spi: "SPI",
        usb: "USB"
    };

    const compartilhados = pinInfo.sharedWith
        .map(item => nomes[item] || item)
        .join(", ");

    return `Atenção: este pino é compartilhado com ${compartilhados}.`;
}

function updatePinBlockVisual(block, pinType) {
    const profile = getMihuBoardProfile();
    const value = block.getFieldValue("PIN");
    const pinInfo = profile.getPinInfo(pinType, value);

    if (!pinInfo) {
        block.setColour(getMihuColor(pinType));
        block.setWarningText(null);
        return;
    }

    const isShared = pinInfo.sharedWith && pinInfo.sharedWith.length > 0;

    if (isShared) {
        block.setColour(getMihuColor("shared"));
        block.setWarningText(formatSharedWarning(pinInfo));
    } else {
        block.setColour(getMihuColor(pinInfo.family || pinType));
        block.setWarningText(null);
    }
}

function createPinBlock(blockName, labelText, pinType, optionsGetter, defaultColor) {
    Blockly.Blocks[blockName] = {
        init() {
            this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown(function () {
                    return getMihuBoardProfile()[optionsGetter]();
                }), "PIN");

            this.setOutput(true, "Number");
            this.setColour(defaultColor);
            this.setTooltip("Seleciona um pino da placa MIHU.");

            this.setOnChange(function () {
                updatePinBlockVisual(this, pinType);
            });
        }
    };
}

// =====================================================
// PINOS
// =====================================================

createPinBlock(
    "pins_digital",
    "GPIO",
    "digital",
    "getDigitalPinOptions",
    getMihuColor("digital")
);

createPinBlock(
    "pins_analog",
    "ADC",
    "analog",
    "getAnalogPinOptions",
    getMihuColor("analog")
);

createPinBlock(
    "pins_pwm",
    "PWM",
    "pwm",
    "getPwmPinOptions",
    getMihuColor("digital")
);

createPinBlock(
    "pins_uart",
    "UART",
    "uart",
    "getUartPinOptions",
    getMihuColor("uart")
);

createPinBlock(
    "pins_rtc",
    "RTC",
    "rtc",
    "getRtcPinOptions",
    getMihuColor("rtc")
);

createPinBlock(
    "pins_touch",
    "TOUCH",
    "touch",
    "getTouchPinOptions",
    getMihuColor("touch")
);

// =====================================================
// ALTO / BAIXO
// =====================================================

Blockly.Blocks["inout_highlow"] = {
    init() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["ALTO (1)", "1"],
                ["BAIXO (0)", "0"]
            ]), "STATUS");

        this.setOutput(true, "Number");
        this.setColour("#27AE60");
        this.setTooltip("Seleciona nível lógico alto ou baixo.");
    }
};

console.log("Blocos de pinos MIHU registrados.");