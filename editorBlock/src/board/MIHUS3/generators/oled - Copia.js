// src/board/MIHUS3/generators/oled.js

'use strict';

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

function mihuSetupOled() {
    window.mihuAddImport("from lib.mihuOled import mihuOled as oled");
    window.mihuAddSetup("oled.init()");
}

function mihuAddSleepMs() {
    window.mihuAddImport("from time import sleep_ms");
}

function mihuAddIconImport(iconModule, iconName) {
    if (!iconModule || !iconName) {
        return;
    }

    window.mihuAddImport(
        "from lib.mihuOled.icons." + iconModule + " import " + iconName
    );
}

function mihuValue(generator, block, name, fallback) {
    generator = generator || Blockly.Python;
    return generator.valueToCode(block, name, generator.ORDER_ATOMIC) || fallback;
}

function mihuParseIconValue(iconValue) {
    if (!iconValue) {
        return {
            module: "eye_picture",
            name: "Neutral"
        };
    }

    const parts = String(iconValue).split(":");

    if (parts.length >= 2) {
        return {
            module: parts[0],
            name: parts[1]
        };
    }

    // Compatibilidade com dropdown antigo:
    // valores antigos vinham apenas como "Winking", "Awake", "Eyes_Angry" etc.
    return {
        module: "eye_picture",
        name: iconValue
    };
}

function mihuIconX(iconModule) {
    // Ícones de olhos geralmente são 89x64.
    if (iconModule === "eye_picture") {
        return 19;
    }

    // Demais ícones normalmente são 64x64.
    return 32;
}

function mihuIconY(iconModule) {
    return 0;
}


// =====================================================
// OLED LIMPAR
// =====================================================

Blockly.Python.forBlock["oled_clear"] = function(block, generator) {
    mihuSetupOled();

    return (
        "oled.clear()\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_clear"] =
    Blockly.Python.forBlock["oled_clear"];


// =====================================================
// OLED ATUALIZAR
// =====================================================

Blockly.Python.forBlock["oled_show"] = function(block, generator) {
    mihuSetupOled();

    return "oled.show()\n";
};

Blockly.Python["oled_show"] =
    Blockly.Python.forBlock["oled_show"];


// =====================================================
// OLED INVERTER
// =====================================================

Blockly.Python.forBlock["oled_invert"] = function(block, generator) {
    mihuSetupOled();

    const value = block.getFieldValue("VALUE") || "True";

    return (
        "oled.invert(" + value + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_invert"] =
    Blockly.Python.forBlock["oled_invert"];


// =====================================================
// OLED TEXTO
// =====================================================

Blockly.Python.forBlock["oled_text"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const text = mihuValue(generator, block, "TEXT", '""');
    const x = mihuValue(generator, block, "X", "0");
    const y = mihuValue(generator, block, "Y", "0");

    return (
        "oled.text(str(" + text + "), " + x + ", " + y + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_text"] =
    Blockly.Python.forBlock["oled_text"];


// =====================================================
// OLED CENTRALIZAR
// =====================================================

Blockly.Python.forBlock["oled_center"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const text = mihuValue(generator, block, "TEXT", '""');
    const y = mihuValue(generator, block, "Y", "0");

    return (
        "oled.center(str(" + text + "), " + y + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_center"] =
    Blockly.Python.forBlock["oled_center"];


// =====================================================
// OLED TEXTO GRANDE
// =====================================================

Blockly.Python.forBlock["oled_text_scale"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const text = mihuValue(generator, block, "TEXT", '""');
    const x = mihuValue(generator, block, "X", "0");
    const y = mihuValue(generator, block, "Y", "0");
    const scale = mihuValue(generator, block, "SCALE", "2");

    return (
        "oled.textScale(str(" + text + "), " + x + ", " + y + ", scale=" + scale + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_text_scale"] =
    Blockly.Python.forBlock["oled_text_scale"];


// =====================================================
// OLED PIXEL
// =====================================================

Blockly.Python.forBlock["oled_pixel"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const x = mihuValue(generator, block, "X", "0");
    const y = mihuValue(generator, block, "Y", "0");
    const color = mihuValue(generator, block, "COLOR", "1");

    return (
        "oled.pixel(" + x + ", " + y + ", " + color + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_pixel"] =
    Blockly.Python.forBlock["oled_pixel"];


// =====================================================
// OLED LINHA
// =====================================================

// =====================================================
// OLED LINHA
// =====================================================

Blockly.Python.forBlock["oled_line"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const x0 = mihuValue(generator, block, "X0", "0");
    const y0 = mihuValue(generator, block, "Y0", "0");
    const x1 = mihuValue(generator, block, "X1", "40");
    const y1 = mihuValue(generator, block, "Y1", "20");
    const color = mihuValue(generator, block, "COLOR", "1");

    return (
        "oled.line(" + x0 + ", " + y0 + ", " + x1 + ", " + y1 + ", " + color + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_line"] =
    Blockly.Python.forBlock["oled_line"];


// =====================================================
// OLED RETÂNGULO
// =====================================================

// =====================================================
// OLED RETÂNGULO
// =====================================================

Blockly.Python.forBlock["oled_rect"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const mode = block.getFieldValue("MODE") || "OUTLINE";

    const x = mihuValue(generator, block, "X", "0");
    const y = mihuValue(generator, block, "Y", "0");
    const w = mihuValue(generator, block, "W", "40");
    const h = mihuValue(generator, block, "H", "20");
    const color = mihuValue(generator, block, "COLOR", "1");

    if (mode === "FILL") {
        return (
            "oled.fillRect(" + x + ", " + y + ", " + w + ", " + h + ", " + color + ")\n" +
            "oled.show()\n"
        );
    }

    return (
        "oled.rect(" + x + ", " + y + ", " + w + ", " + h + ", " + color + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_rect"] =
    Blockly.Python.forBlock["oled_rect"];


// =====================================================
// OLED RETÂNGULO PREENCHIDO
// =====================================================

Blockly.Python.forBlock["oled_fill_rect"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const x = mihuValue(generator, block, "X", "0");
    const y = mihuValue(generator, block, "Y", "0");
    const w = mihuValue(generator, block, "W", "20");
    const h = mihuValue(generator, block, "H", "10");
    const color = mihuValue(generator, block, "COLOR", "1");

    return (
        "oled.fillRect(" + x + ", " + y + ", " + w + ", " + h + ", " + color + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_fill_rect"] =
    Blockly.Python.forBlock["oled_fill_rect"];


// =====================================================
// OLED SET CURSOR
// =====================================================

Blockly.Python.forBlock["oled_set_cursor"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const x = mihuValue(generator, block, "X", "0");
    const y = mihuValue(generator, block, "Y", "0");

    return "oled.setCursor(" + x + ", " + y + ")\n";
};

Blockly.Python["oled_set_cursor"] =
    Blockly.Python.forBlock["oled_set_cursor"];


// =====================================================
// OLED PRINT
// =====================================================

Blockly.Python.forBlock["oled_print"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const text = mihuValue(generator, block, "TEXT", '""');

    return (
        "oled.print(str(" + text + "))\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_print"] =
    Blockly.Python.forBlock["oled_print"];


// =====================================================
// OLED PRINTLN
// =====================================================

Blockly.Python.forBlock["oled_println"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const text = mihuValue(generator, block, "TEXT", '""');

    return (
        "oled.println(str(" + text + "))\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_println"] =
    Blockly.Python.forBlock["oled_println"];


// =====================================================
// OLED FONTE
// =====================================================

Blockly.Python.forBlock["oled_set_font"] = function(block, generator) {
    mihuSetupOled();

    const font = block.getFieldValue("FONT") || "None";

    return "oled.setFont(" + font + ")\n";
};

Blockly.Python["oled_set_font"] =
    Blockly.Python.forBlock["oled_set_font"];


// =====================================================
// OLED SCROLL TEXTO GRANDE
// =====================================================

Blockly.Python.forBlock["oled_scroll_text_scale_tick"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();

    const text = mihuValue(generator, block, "TEXT", '""');
    const y = mihuValue(generator, block, "Y", "0");
    const scale = mihuValue(generator, block, "SCALE", "2");
    const speed = mihuValue(generator, block, "SPEED", "2");

    return (
        "oled.clear()\n" +
        "oled.scrollTextScaleTick(str(" + text + "), " + y + ", scale=" + scale + ", speed=" + speed + ")\n" +
        "oled.show()\n"
    );
};

Blockly.Python["oled_scroll_text_scale_tick"] =
    Blockly.Python.forBlock["oled_scroll_text_scale_tick"];


// =====================================================
// OLED RESET SCROLL
// =====================================================

Blockly.Python.forBlock["oled_reset_scroll"] = function(block, generator) {
    mihuSetupOled();

    return "oled.resetScroll()\n";
};

Blockly.Python["oled_reset_scroll"] =
    Blockly.Python.forBlock["oled_reset_scroll"];


// =====================================================
// DISPLAY - EXIBIR ÍCONE POR TEMPO
// Bloco novo: display_show_icon_time
// Campo: ICON
// Valor esperado: "modulo:Icone"
// Exemplo: "eye_picture:Winking"
// =====================================================

Blockly.Python.forBlock["display_show_icon_time"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();
    mihuAddSleepMs();

    const iconValue = block.getFieldValue("ICON") || "eye_picture:Neutral";
    const parsed = mihuParseIconValue(iconValue);

    const iconModule = parsed.module;
    const iconName = parsed.name;

    const x = mihuIconX(iconModule);
    const y = mihuIconY(iconModule);

    let timeValue = generator.valueToCode(
        block,
        "TIME",
        generator.ORDER_ATOMIC
    );

    if (!timeValue) {
        timeValue = "1";
    }

    mihuAddIconImport(iconModule, iconName);

    return (
        "oled.clear()\n" +
        "oled.icon(" + iconName + ", " + x + ", " + y + ")\n" +
        "oled.show()\n" +
        "sleep_ms(int((" + timeValue + ") * 1000))\n"
    );
};

Blockly.Python["display_show_icon_time"] =
    Blockly.Python.forBlock["display_show_icon_time"];


// =====================================================
// DISPLAY - EXIBIR OLHOS POR TEMPO
// Compatibilidade com bloco antigo: display_show_eyes_time
// Aceita campo ICON ou campo antigo EYES.
// =====================================================

Blockly.Python.forBlock["display_show_eyes_time"] = function(block, generator) {
    generator = generator || Blockly.Python;

    mihuSetupOled();
    mihuAddSleepMs();

    let iconValue = null;

    try {
        iconValue = block.getFieldValue("ICON");
    } catch (e) {
        iconValue = null;
    }

    if (!iconValue) {
        try {
            iconValue = block.getFieldValue("EYES");
        } catch (e) {
            iconValue = null;
        }
    }

    if (!iconValue) {
        iconValue = "eye_picture:Neutral";
    }

    const parsed = mihuParseIconValue(iconValue);

    const iconModule = parsed.module;
    const iconName = parsed.name;

    const x = mihuIconX(iconModule);
    const y = mihuIconY(iconModule);

    let timeValue = generator.valueToCode(
        block,
        "TIME",
        generator.ORDER_ATOMIC
    );

    if (!timeValue) {
        timeValue = "1";
    }

    mihuAddIconImport(iconModule, iconName);

    return (
        "oled.clear()\n" +
        "oled.icon(" + iconName + ", " + x + ", " + y + ")\n" +
        "oled.show()\n" +
        "sleep_ms(int((" + timeValue + ") * 1000))\n"
    );
};

Blockly.Python["display_show_eyes_time"] =
    Blockly.Python.forBlock["display_show_eyes_time"];


console.log("Generators OLED MIHU registrados.");