// Geradores Python dos blocos verde-azulados da categoria MP3.

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function mihuMp3Import() {
    Blockly.Python.definitions_["import_mihu_mp3"] = `
try:
    from Lib.mihuMp3 import *
except:
    from lib.mihuMp3 import *
`;
}

Blockly.Python.forBlock["mihu_mp3_play_file"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuMp3Import();

    const file = generator.valueToCode(block, "FILE", generator.ORDER_ATOMIC) || "1";

    return `playMp3File(${file})\n`;
};

Blockly.Python["mihu_mp3_play_file"] =
    Blockly.Python.forBlock["mihu_mp3_play_file"];

Blockly.Python.forBlock["mihu_mp3_pause"] = function() {
    mihuMp3Import();
    return "pauseMp3()\n";
};

Blockly.Python["mihu_mp3_pause"] =
    Blockly.Python.forBlock["mihu_mp3_pause"];

Blockly.Python.forBlock["mihu_mp3_next"] = function() {
    mihuMp3Import();
    return "nextMp3()\n";
};

Blockly.Python["mihu_mp3_next"] =
    Blockly.Python.forBlock["mihu_mp3_next"];

Blockly.Python.forBlock["mihu_mp3_previous"] = function() {
    mihuMp3Import();
    return "previousMp3()\n";
};

Blockly.Python["mihu_mp3_previous"] =
    Blockly.Python.forBlock["mihu_mp3_previous"];

console.log("Generators MP3 MIHU registrados.");
