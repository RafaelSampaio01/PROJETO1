// Blocos verde-azulados da categoria MP3.

const MIHU_MP3_COLOUR = "#008d8f";

Blockly.Blocks["mihu_mp3_play_file"] = {
    init() {
        this.appendValueInput("FILE")
            .setCheck("Number")
            .appendField("Toque MP3 Arquivo");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_MP3_COLOUR);
        this.setTooltip("Toca o arquivo MP3 pelo número informado.");
    }
};

Blockly.Blocks["mihu_mp3_pause"] = {
    init() {
        this.appendDummyInput()
            .appendField("Pause MP3 Toque");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_MP3_COLOUR);
        this.setTooltip("Pausa a reprodução do MP3.");
    }
};

Blockly.Blocks["mihu_mp3_next"] = {
    init() {
        this.appendDummyInput()
            .appendField("Toque nas próximas música");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_MP3_COLOUR);
        this.setTooltip("Toca a próxima música.");
    }
};

Blockly.Blocks["mihu_mp3_previous"] = {
    init() {
        this.appendDummyInput()
            .appendField("Toque a última música");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_MP3_COLOUR);
        this.setTooltip("Toca a música anterior.");
    }
};

console.log("Blocos MP3 MIHU registrados.");
