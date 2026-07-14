// src/board/MIHUS3/generators/inOut.js

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

if (typeof window.mihuAddSetup !== "function") {
    window.mihuAddSetup = function(setupLine) {
        window.MIHU_SETUP = window.MIHU_SETUP || new Set();
        window.MIHU_SETUP.add(setupLine);
    };
}

function mihuSanitizeName(value) {
    return String(value).replace(/[^a-zA-Z0-9_]/g, "_");
}

// =====================================================
// DEFINIR PINO DIGITAL
// Gera:
// from machine import Pin
// _pin_digital_22 = Pin(22, Pin.OUT)
// _pin_digital_22.value(1)
// =====================================================


// =====================================================
// CONFIGURAR MODO DO PINO DIGITAL
// =====================================================

Blockly.Python.forBlock["inout_pin_mode"] = function(block, generator) {
    generator = generator || Blockly.Python;

    window.mihuAddImport("from machine import Pin");

    const pin = generator.valueToCode(
        block,
        "PIN",
        generator.ORDER_ATOMIC
    ) || "0";

    const mode = block.getFieldValue("MODE") || "INPUT";

    let code = "";

    if (mode === "INPUT") {
        code = "_pin_" + pin + " = Pin(" + pin + ", Pin.IN)\n";
    }
    else if (mode === "OUTPUT") {
        code = "_pin_" + pin + " = Pin(" + pin + ", Pin.OUT)\n";
    }
    else if (mode === "INPUT_PULLUP") {
        code = "_pin_" + pin + " = Pin(" + pin + ", Pin.IN, Pin.PULL_UP)\n";
    }
    else if (mode === "INPUT_PULLDOWN") {
        code = "_pin_" + pin + " = Pin(" + pin + ", Pin.IN, Pin.PULL_DOWN)\n";
    }

    return code;
};

Blockly.Python["inout_pin_mode"] =
    Blockly.Python.forBlock["inout_pin_mode"];


    
Blockly.Python.forBlock["inout_digital_write"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const pin = generator.valueToCode(block, "PIN", generator.ORDER_ATOMIC) || "0";
    const status = generator.valueToCode(block, "STAT", generator.ORDER_ATOMIC) || "1";

    const pinName = "_pin_digital_" + mihuSanitizeName(pin);

    window.mihuAddImport("from machine import Pin");
    window.mihuAddSetup(`${pinName} = Pin(${pin}, Pin.OUT)`);

    return `${pinName}.value(${status})\n`;
};

Blockly.Python["inout_digital_write"] =
    Blockly.Python.forBlock["inout_digital_write"];

// =====================================================
// LER PINO DIGITAL
// Gera:
// from machine import Pin
// _pin_input_22 = Pin(22, Pin.IN)
// _pin_input_22.value()
// =====================================================

Blockly.Python.forBlock["inout_digital_read"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const pin = generator.valueToCode(block, "PIN", generator.ORDER_ATOMIC) || "0";
    const pinName = "_pin_input_" + mihuSanitizeName(pin);

    window.mihuAddImport("from machine import Pin");
    window.mihuAddSetup(`${pinName} = Pin(${pin}, Pin.IN)`);

    const code = `${pinName}.value()`;

    return [code, generator.ORDER_ATOMIC];
};

Blockly.Python["inout_digital_read"] =
    Blockly.Python.forBlock["inout_digital_read"];

// =====================================================
// DEFINIR PINO PWM
// Gera:
// from machine import Pin, PWM
// _pwm_22 = PWM(Pin(22), freq=1000)
// _pwm_22.duty_u16(valor)
// =====================================================

Blockly.Python.forBlock["inout_pwm_write"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const pin = generator.valueToCode(block, "PIN", generator.ORDER_ATOMIC) || "0";
    const value = generator.valueToCode(block, "VALUE", generator.ORDER_ATOMIC) || "0";

    const pwmName = "_pwm_" + mihuSanitizeName(pin);

    window.mihuAddImport("from machine import Pin, PWM");
    window.mihuAddSetup(`${pwmName} = PWM(Pin(${pin}), freq=1000)`);

    return `${pwmName}.duty_u16(max(0, min(65535, int(${value}))))\n`;
};

Blockly.Python["inout_pwm_write"] =
    Blockly.Python.forBlock["inout_pwm_write"];

// =====================================================
// LER PINO ANALÓGICO
// Gera:
// from machine import Pin, ADC
// _adc_1 = ADC(Pin(1))
// _adc_1.read()
// =====================================================

Blockly.Python.forBlock["inout_analog_read"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const pin = generator.valueToCode(block, "PIN", generator.ORDER_ATOMIC) || "1";
    const adcName = "_adc_" + mihuSanitizeName(pin);

    window.mihuAddImport("from machine import Pin, ADC");
    window.mihuAddSetup(`${adcName} = ADC(Pin(${pin}))`);

    const code = `${adcName}.read()`;

    return [code, generator.ORDER_ATOMIC];
};

Blockly.Python["inout_analog_read"] =
    Blockly.Python.forBlock["inout_analog_read"];

// =====================================================
// PARAR PWM
// Gera:
// _pwm_22.deinit()
// =====================================================

Blockly.Python.forBlock["inout_pwm_stop"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const pin = generator.valueToCode(block, "PIN", generator.ORDER_ATOMIC) || "0";
    const pwmName = "_pwm_" + mihuSanitizeName(pin);

    return (
        `try:\n` +
        `    ${pwmName}.deinit()\n` +
        `except:\n` +
        `    pass\n`
    );
};

Blockly.Python["inout_pwm_stop"] =
    Blockly.Python.forBlock["inout_pwm_stop"];


// =====================================================
// HELPERS AUXILIARES
// =====================================================

if (typeof window.mihuAddImport !== "function") {
    window.mihuAddImport = function(importLine) {
        window.MIHU_IMPORTS = window.MIHU_IMPORTS || new Set();
        window.MIHU_IMPORTS.add(importLine);
    };
}

if (typeof window.mihuAddSetup !== "function") {
    window.mihuAddSetup = function(setupLine) {
        window.MIHU_SETUP = window.MIHU_SETUP || new Set();
        window.MIHU_SETUP.add(setupLine);
    };
}

function mihuSanitizeName(value) {
    return String(value).replace(/[^a-zA-Z0-9_]/g, "_");
}

function mihuNormalizeCallbackCode(code) {
    if (!code || !code.trim()) {
        return "        pass\n";
    }

    let linhas = code.split("\n");

    while (linhas.length && linhas[0].trim() === "") linhas.shift();
    while (linhas.length && linhas[linhas.length - 1].trim() === "") linhas.pop();

    if (!linhas.length) {
        return "        pass\n";
    }

    let menorIndentacao = null;

    for (let linha of linhas) {
        if (linha.trim() === "") continue;

        const match = linha.match(/^ */);
        const qtd = match ? match[0].length : 0;

        if (menorIndentacao === null || qtd < menorIndentacao) {
            menorIndentacao = qtd;
        }
    }

    if (menorIndentacao === null) menorIndentacao = 0;

    linhas = linhas.map(linha => {
        if (linha.trim() === "") return "";
        return linha.slice(menorIndentacao);
    });

    linhas = linhas.map(linha => {
        if (linha.trim() === "") return "";
        return "        " + linha;
    });

    return linhas.join("\n") + "\n";
}


// =====================================================
// LEITURA TOUCH
// Gera:
// from machine import Pin, TouchPad
// _touch_1 = TouchPad(Pin(1))
// _touch_1.read()
// =====================================================

Blockly.Python.forBlock["inout_touch_read"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const pin = generator.valueToCode(block, "PIN", generator.ORDER_ATOMIC) || "1";
    const touchName = "_touch_" + mihuSanitizeName(pin);

    window.mihuAddImport("from machine import Pin, TouchPad");
    window.mihuAddSetup(`${touchName} = TouchPad(Pin(${pin}))`);

    return [`${touchName}.read()`, generator.ORDER_ATOMIC];
};

Blockly.Python["inout_touch_read"] =
    Blockly.Python.forBlock["inout_touch_read"];


// =====================================================
// INTERRUPÇÃO DIGITAL
// Gera no setup automático:
// _irq_pin_22 = Pin(22, Pin.IN)
// def _on_irq_pin_22(pin):
//     if pin.value() == 1:
//         ...
// _irq_pin_22.irq(trigger=Pin.IRQ_RISING, handler=_on_irq_pin_22)
// =====================================================

Blockly.Python.forBlock["inout_digital_interrupt"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const pin = generator.valueToCode(block, "PIN", generator.ORDER_ATOMIC) || "0";
    const level = block.getFieldValue("LEVEL") || "1";

    const safePin = mihuSanitizeName(pin);
    const pinName = "_irq_pin_" + safePin;
    const funcName = "_on_irq_pin_" + safePin + "_" + level;

    let doCode = generator.statementToCode(block, "DO") || "";
    doCode = mihuNormalizeCallbackCode(doCode);

    const trigger = level === "1" ? "Pin.IRQ_RISING" : "Pin.IRQ_FALLING";

    window.mihuAddImport("from machine import Pin");

    window.mihuAddSetup(
        `${pinName} = Pin(${pin}, Pin.IN)\n` +
        `def ${funcName}(pin):\n` +
        `    if pin.value() == ${level}:\n` +
        doCode +
        `${pinName}.irq(trigger=${trigger}, handler=${funcName})`
    );

    return "";
};

Blockly.Python["inout_digital_interrupt"] =
    Blockly.Python.forBlock["inout_digital_interrupt"];

    
console.log("Generators de Entrada/Saída MIHU registrados.");