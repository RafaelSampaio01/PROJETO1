// Geradores Python dos blocos laranja da categoria Variáveis.

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function mihuVariableName(block) {
    const variableId = block.getFieldValue("VAR");
    const variable = Blockly.getMainWorkspace().getVariableById(variableId);
    const rawName = variable ? variable.name : "my variable";

    if (Blockly.Python.nameDB_) {
        return Blockly.Python.nameDB_.getName(rawName, Blockly.Names.NameType.VARIABLE);
    }

    return rawName.replace(/[^A-Za-z0-9_]/g, "_") || "my_variable";
}

Blockly.Python.forBlock["mihu_variable_get"] = function(block, generator) {
    generator = generator || Blockly.Python;

    return [mihuVariableName(block), generator.ORDER_ATOMIC];
};

Blockly.Python["mihu_variable_get"] =
    Blockly.Python.forBlock["mihu_variable_get"];

Blockly.Python.forBlock["mihu_variable_set"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const variableName = mihuVariableName(block);
    const value = generator.valueToCode(block, "VALUE", generator.ORDER_NONE) || "0";

    return `${variableName} = ${value}\n`;
};

Blockly.Python["mihu_variable_set"] =
    Blockly.Python.forBlock["mihu_variable_set"];

Blockly.Python.forBlock["mihu_variable_change"] = function(block, generator) {
    generator = generator || Blockly.Python;

    const variableName = mihuVariableName(block);
    const value = generator.valueToCode(block, "VALUE", generator.ORDER_NONE) || "1";

    return `${variableName} = ${variableName} + (${value})\n`;
};

Blockly.Python["mihu_variable_change"] =
    Blockly.Python.forBlock["mihu_variable_change"];

Blockly.Python.forBlock["mihu_variable_show"] = function(block) {
    const variableName = mihuVariableName(block);

    return `print("${variableName} =", ${variableName})\n`;
};

Blockly.Python["mihu_variable_show"] =
    Blockly.Python.forBlock["mihu_variable_show"];

Blockly.Python.forBlock["mihu_variable_hide"] = function() {
    return "";
};

Blockly.Python["mihu_variable_hide"] =
    Blockly.Python.forBlock["mihu_variable_hide"];

console.log("Generators variáveis MIHU registrados.");
