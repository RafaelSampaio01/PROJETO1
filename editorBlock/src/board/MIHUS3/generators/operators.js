// Geradores Python dos blocos verdes da categoria Operadores.

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function mihuValue(generator, block, inputName, fallback) {
    return generator.valueToCode(block, inputName, generator.ORDER_NONE) || fallback;
}

Blockly.Python.forBlock["mihu_operator_arithmetic"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const operators = {
        ADD: "+",
        MINUS: "-",
        MULTIPLY: "*",
        DIVIDE: "/"
    };
    const left = mihuValue(generator, block, "A", "0");
    const right = mihuValue(generator, block, "B", "0");
    const operator = operators[block.getFieldValue("OP")] || "+";

    return [`(${left} ${operator} ${right})`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_arithmetic"] =
    Blockly.Python.forBlock["mihu_operator_arithmetic"];

Blockly.Python.forBlock["mihu_operator_random"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const from = mihuValue(generator, block, "FROM", "1");
    const to = mihuValue(generator, block, "TO", "10");

    window.mihuAddImport("import random");

    return [`random.randint(int(${from}), int(${to}))`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_random"] =
    Blockly.Python.forBlock["mihu_operator_random"];

Blockly.Python.forBlock["mihu_operator_compare"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const operators = {
        LT: "<",
        EQ: "==",
        GT: ">"
    };
    const left = mihuValue(generator, block, "A", "0");
    const right = mihuValue(generator, block, "B", "0");
    const operator = operators[block.getFieldValue("OP")] || "==";

    return [`(${left} ${operator} ${right})`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_compare"] =
    Blockly.Python.forBlock["mihu_operator_compare"];

Blockly.Python.forBlock["mihu_operator_boolean"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const operator = block.getFieldValue("OP") === "OR" ? "or" : "and";
    const left = mihuValue(generator, block, "A", "False");
    const right = mihuValue(generator, block, "B", "False");

    return [`(${left} ${operator} ${right})`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_boolean"] =
    Blockly.Python.forBlock["mihu_operator_boolean"];

Blockly.Python.forBlock["mihu_operator_not"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const value = mihuValue(generator, block, "VALUE", "False");

    return [`(not (${value}))`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_not"] =
    Blockly.Python.forBlock["mihu_operator_not"];

Blockly.Python.forBlock["mihu_operator_join"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const left = mihuValue(generator, block, "A", "\"\"");
    const right = mihuValue(generator, block, "B", "\"\"");

    return [`(str(${left}) + str(${right}))`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_join"] =
    Blockly.Python.forBlock["mihu_operator_join"];

Blockly.Python.forBlock["mihu_operator_letter_of"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const index = mihuValue(generator, block, "INDEX", "1");
    const text = mihuValue(generator, block, "TEXT", "\"\"");

    return [`str(${text})[max(0, int(${index}) - 1)]`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_letter_of"] =
    Blockly.Python.forBlock["mihu_operator_letter_of"];

Blockly.Python.forBlock["mihu_operator_length"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const text = mihuValue(generator, block, "TEXT", "\"\"");

    return [`len(str(${text}))`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_length"] =
    Blockly.Python.forBlock["mihu_operator_length"];

Blockly.Python.forBlock["mihu_operator_contains"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const text = mihuValue(generator, block, "TEXT", "\"\"");
    const subtext = mihuValue(generator, block, "SUBTEXT", "\"\"");

    return [`(str(${subtext}) in str(${text}))`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_contains"] =
    Blockly.Python.forBlock["mihu_operator_contains"];

Blockly.Python.forBlock["mihu_operator_mod"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const left = mihuValue(generator, block, "A", "0");
    const right = mihuValue(generator, block, "B", "1");

    return [`(${left} % ${right})`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_mod"] =
    Blockly.Python.forBlock["mihu_operator_mod"];

Blockly.Python.forBlock["mihu_operator_round"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const value = mihuValue(generator, block, "VALUE", "0");

    return [`round(${value})`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_round"] =
    Blockly.Python.forBlock["mihu_operator_round"];

Blockly.Python.forBlock["mihu_operator_abs"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const value = mihuValue(generator, block, "VALUE", "0");

    return [`abs(${value})`, generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_operator_abs"] =
    Blockly.Python.forBlock["mihu_operator_abs"];

console.log("Generators operadores MIHU registrados.");
