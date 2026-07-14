// Blocos roxo-azulados da categoria sem fio.

const MIHU_WIRELESS_COLOUR = "#5c6eb3";

Blockly.Blocks["mihu_wireless_get_data"] = {
    init() {
        this.appendDummyInput()
            .appendField("Obter WiFi dados");

        this.setOutput(true, "String");
        this.setColour(MIHU_WIRELESS_COLOUR);
    }
};

Blockly.Blocks["mihu_wireless_get_puller"] = {
    init() {
        this.appendDummyInput()
            .appendField("Obter WiFi puller")
            .appendField(new Blockly.FieldDropdown([
                ["esquerdo", "LEFT"],
                ["direito", "RIGHT"],
                ["cima", "UP"],
                ["baixo", "DOWN"]
            ]), "SIDE");

        this.setOutput(true, "Number");
        this.setColour(MIHU_WIRELESS_COLOUR);
    }
};

Blockly.Blocks["mihu_wireless_get_button"] = {
    init() {
        this.appendDummyInput()
            .appendField("Obter WiFi botão")
            .appendField(new Blockly.FieldDropdown([
                ["1", "1"],
                ["2", "2"],
                ["3", "3"],
                ["4", "4"]
            ]), "BUTTON");

        this.setOutput(true, "Boolean");
        this.setColour(MIHU_WIRELESS_COLOUR);
    }
};

Blockly.Blocks["mihu_wireless_udp_remote"] = {
    init() {
        this.appendValueInput("IP")
            .appendField("Definir WiFi UDP modo remoto IP");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_WIRELESS_COLOUR);
    }
};

Blockly.Blocks["mihu_wireless_set_data"] = {
    init() {
        this.appendValueInput("DATA")
            .appendField("Definir WiFi dados");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_WIRELESS_COLOUR);
    }
};

Blockly.Blocks["mihu_wireless_get_voice"] = {
    init() {
        this.appendValueInput("VOICE")
            .appendField("Obter WiFi voz");

        this.setOutput(true, "String");
        this.setColour(MIHU_WIRELESS_COLOUR);
    }
};

Blockly.Blocks["mihu_wireless_voice_line"] = {
    init() {
        this.appendValueInput("LINE")
            .setCheck("Number")
            .appendField("Definir WiFi linha de corda de voz line");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_WIRELESS_COLOUR);
    }
};

console.log("Blocos sem fio MIHU registrados.");
