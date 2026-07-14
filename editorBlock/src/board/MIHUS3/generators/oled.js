// =====================================================
// MIHU OLED - Geradores MicroPython dos blocos fáceis
// Caminho sugerido: src/board/MIHUS3/generators/micropython/mihuOledFacil.js
// Biblioteca alvo: from Lib.mihuOled import mihuOled as oled
// =====================================================

(function () {
    const PY = Blockly.Python || Blockly.MicroPython || Blockly.Arduino;

    if (!PY) {
        console.warn("MIHU OLED Fácil: nenhum gerador Python/MicroPython/Arduino encontrado.");
        return;
    }

    function register(name, fn) {
        if (PY.forBlock) {
            PY.forBlock[name] = fn;
        }
        PY[name] = function (block) {
            return fn(block, PY);
        };
    }

    function order(generator) {
        return generator.ORDER_ATOMIC || 0;
    }

    function value(block, generator, name, fallback) {
        return generator.valueToCode(block, name, order(generator)) || fallback;
    }

    function pyString(text) {
        return JSON.stringify(String(text));
    }

    function addImport(generator) {
        generator.definitions_ = generator.definitions_ || {};
        generator.definitions_["import_mihu_oled"] = "from Lib.mihuOled import mihuOled as oled";
    }

    function addHelpers(generator) {
        generator.definitions_ = generator.definitions_ || {};
        generator.definitions_["mihu_oled_facil_helpers"] = `
def _oled_facil_font(font_name=None):
    if font_name in (None, "", "NONE", "atual"):
        return None
    if font_name == "DEFAULT":
        try:
            oled.setFontNone()
        except Exception:
            pass
        return None
    return font_name


def _oled_facil_key(x, y):
    return "_oled_auto_" + str(int(x)) + "_" + str(int(y))


def _oled_facil_size(value, font_name=None):
    font_name = _oled_facil_font(font_name)
    try:
        return oled.textSize(str(value), font_name=font_name)
    except Exception:
        return (len(str(value)) * 8, 8)


def _oled_facil_escrever(value, x=0, y=0, font_name=None):
    x = int(x)
    y = int(y)
    font_name = _oled_facil_font(font_name)
    key = _oled_facil_key(x, y)

    # Se for número, já usa atualização limpa automaticamente.
    # Para texto também usa a mesma lógica, evitando restos quando o texto muda.
    if type(value) in (int, float):
        oled.updateText(value, x, y, key=key, font_name=font_name)
    else:
        oled.updateText(str(value), x, y, key=key, font_name=font_name)


def _oled_facil_centralizar(value, y=0, font_name=None):
    y = int(y)
    font_name = _oled_facil_font(font_name)
    w, h = _oled_facil_size(value, font_name)
    x = (128 - int(w)) // 2
    if x < 0:
        x = 0
    _oled_facil_escrever(value, x, y, font_name)
`;
    }

    register("mihu_oled_facil_iniciar", function (block, generator) {
        addImport(generator);
        const bg = block.getFieldValue("BG") || "0";
        const auto = block.getFieldValue("AUTO") || "True";
        let code = "oled.init()\n";
        code += "oled.autoShow(" + auto + ")\n";
        code += "oled.clear(" + bg + ")\n";
        try {
            code += "oled.clearTextCache()\n";
        } catch (e) {}
        return code;
    });

    register("mihu_oled_facil_limpar", function (block, generator) {
        addImport(generator);
        const color = block.getFieldValue("COLOR") || "0";
        return "oled.clear(" + color + ")\ntry:\n    oled.clearTextCache()\nexcept Exception:\n    pass\n";
    });

    register("mihu_oled_facil_limpar_area", function (block, generator) {
        addImport(generator);
        const x = block.getFieldValue("X") || "0";
        const y = block.getFieldValue("Y") || "0";
        const w = block.getFieldValue("W") || "40";
        const h = block.getFieldValue("H") || "12";
        return "oled.clearArea(" + x + ", " + y + ", " + w + ", " + h + ")\n";
    });

    register("mihu_oled_facil_escrever", function (block, generator) {
        addImport(generator);
        addHelpers(generator);
        const text = value(block, generator, "TEXT", "''");
        const x = block.getFieldValue("X") || "0";
        const y = block.getFieldValue("Y") || "0";
        const font = block.getFieldValue("FONT") || "NONE";
        return "_oled_facil_escrever(" + text + ", " + x + ", " + y + ", " + pyString(font) + ")\n";
    });

    register("mihu_oled_facil_centralizar", function (block, generator) {
        addImport(generator);
        addHelpers(generator);
        const text = value(block, generator, "TEXT", "''");
        const y = block.getFieldValue("Y") || "0";
        const font = block.getFieldValue("FONT") || "NONE";
        return "_oled_facil_centralizar(" + text + ", " + y + ", " + pyString(font) + ")\n";
    });

    register("mihu_oled_facil_linha", function (block, generator) {
        addImport(generator);
        const x1 = block.getFieldValue("X1") || "0";
        const y1 = block.getFieldValue("Y1") || "0";
        const x2 = block.getFieldValue("X2") || "127";
        const y2 = block.getFieldValue("Y2") || "63";
        return "oled.line(" + x1 + ", " + y1 + ", " + x2 + ", " + y2 + ")\n";
    });

    register("mihu_oled_facil_retangulo", function (block, generator) {
        addImport(generator);
        const x = block.getFieldValue("X") || "0";
        const y = block.getFieldValue("Y") || "0";
        const w = block.getFieldValue("W") || "40";
        const h = block.getFieldValue("H") || "20";
        const mode = block.getFieldValue("MODE") || "OUTLINE";
        if (mode === "FILL") {
            return "oled.fillRect(" + x + ", " + y + ", " + w + ", " + h + ")\n";
        }
        return "oled.rect(" + x + ", " + y + ", " + w + ", " + h + ")\n";
    });

    register("mihu_oled_facil_circulo", function (block, generator) {
        addImport(generator);
        const x = block.getFieldValue("X") || "64";
        const y = block.getFieldValue("Y") || "32";
        const r = block.getFieldValue("R") || "10";
        const mode = block.getFieldValue("MODE") || "OUTLINE";
        if (mode === "FILL") {
            return "oled.fillCircle(" + x + ", " + y + ", " + r + ")\n";
        }
        return "oled.circle(" + x + ", " + y + ", " + r + ")\n";
    });

    register("mihu_oled_facil_barra", function (block, generator) {
        addImport(generator);
        const val = value(block, generator, "VALUE", "0");
        const x = block.getFieldValue("X") || "0";
        const y = block.getFieldValue("Y") || "52";
        const w = block.getFieldValue("W") || "128";
        const h = block.getFieldValue("H") || "10";
        return "oled.progressBar(" + x + ", " + y + ", " + w + ", " + h + ", " + val + ")\n";
    });

    register("mihu_oled_facil_simbolo", function (block, generator) {
        addImport(generator);
        const symbol = block.getFieldValue("SYMBOL") || "check";
        const x = block.getFieldValue("X") || "60";
        const y = block.getFieldValue("Y") || "28";
        const size = block.getFieldValue("SIZE") || "12";
        return "oled." + symbol + "(" + x + ", " + y + ", size=" + size + ")\n";
    });
})();
