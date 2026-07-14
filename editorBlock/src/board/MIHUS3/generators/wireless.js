// Geradores Python dos blocos roxo-azulados da categoria sem fio.

Blockly.Python.forBlock = Blockly.Python.forBlock || Object.create(null);

function mihuWirelessImport() {
    Blockly.Python.definitions_["import_mihu_wireless"] = `
try:
    from Lib.mihuWireless import *
except:
    from lib.mihuWireless import *
`;
}

function wirelessValue(generator, block, inputName, fallback) {
    return generator.valueToCode(block, inputName, generator.ORDER_ATOMIC) || fallback;
}

Blockly.Python.forBlock["mihu_wireless_get_data"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuWirelessImport();
    return ["getWifiData()", generator.ORDER_ATOMIC];
};
Blockly.Python["mihu_wireless_get_data"] = Blockly.Python.forBlock["mihu_wireless_get_data"];

Blockly.Python.forBlock["mihu_wireless_get_puller"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuWirelessImport();
    return [`getWifiPuller(${JSON.stringify(block.getFieldValue("SIDE"))})`, generator.ORDER_ATOMIC];
};
Blockly.Python["mihu_wireless_get_puller"] = Blockly.Python.forBlock["mihu_wireless_get_puller"];

Blockly.Python.forBlock["mihu_wireless_get_button"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuWirelessImport();
    return [`getWifiButton(${block.getFieldValue("BUTTON")})`, generator.ORDER_ATOMIC];
};
Blockly.Python["mihu_wireless_get_button"] = Blockly.Python.forBlock["mihu_wireless_get_button"];

Blockly.Python.forBlock["mihu_wireless_udp_remote"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuWirelessImport();
    const ip = wirelessValue(generator, block, "IP", "\"192.168.1.1\"");
    return `setWifiUdpRemote(${ip})\n`;
};
Blockly.Python["mihu_wireless_udp_remote"] = Blockly.Python.forBlock["mihu_wireless_udp_remote"];

Blockly.Python.forBlock["mihu_wireless_set_data"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuWirelessImport();
    const data = wirelessValue(generator, block, "DATA", "255");
    return `setWifiData(${data})\n`;
};
Blockly.Python["mihu_wireless_set_data"] = Blockly.Python.forBlock["mihu_wireless_set_data"];

Blockly.Python.forBlock["mihu_wireless_get_voice"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuWirelessImport();
    const voice = wirelessValue(generator, block, "VOICE", "\"hello\"");
    return [`getWifiVoice(${voice})`, generator.ORDER_ATOMIC];
};
Blockly.Python["mihu_wireless_get_voice"] = Blockly.Python.forBlock["mihu_wireless_get_voice"];

Blockly.Python.forBlock["mihu_wireless_voice_line"] = function(block, generator) {
    generator = generator || Blockly.Python;
    mihuWirelessImport();
    const line = wirelessValue(generator, block, "LINE", "1");
    return `setWifiVoiceLine(${line})\n`;
};
Blockly.Python["mihu_wireless_voice_line"] = Blockly.Python.forBlock["mihu_wireless_voice_line"];

console.log("Generators sem fio MIHU registrados.");
