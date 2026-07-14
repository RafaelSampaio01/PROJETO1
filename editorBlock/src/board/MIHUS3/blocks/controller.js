// Blocos azuis da categoria controlador.

const MIHU_CONTROLLER_COLOUR = "#5aa7f2";

Blockly.Blocks["mihu_controller_target"] = {
    init() {
        this.appendDummyInput()
            .appendField("Inicializar")
           .appendField(new Blockly.FieldDropdown([
               ["tarefa1", "tarefa1"],
               ["tarefa2", "tarefa2"],
               ["tarefa3", "tarefa3"],
               ["tarefa4", "tarefa4"],
               ["tarefa5", "tarefa5"],
               ["tarefa6", "tarefa6"],
               ["tarefa7", "tarefa7"],
               ["tarefa8", "tarefa8"]
           ]), "TARGET");
        this.appendStatementInput("DO");

        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROLLER_COLOUR);
        this.setTooltip("Executa comandos do controlador para o alvo selecionado.");
    }
};

Blockly.Blocks["mihu_controller_button"] = {
    init() {
        this.appendDummyInput()
            .appendField("botão")
            .appendField(new Blockly.FieldDropdown([
                ["Esquerdo", "LEFT"],
                ["Direito", "RIGHT"],
                ["Cima", "UP"],
                ["Baixo", "DOWN"],
                ["Ok", "ENTER"],
                ["Voltar", "BACK"]
            ]), "TYPE")
            .appendField("pressionado?");

        this.setOutput(true, "Boolean");
        this.setColour(MIHU_CONTROLLER_COLOUR);
        this.setTooltip("Verifica se o botão selecionado está pressionado.");
    }
};


Blockly.Blocks["mihu_controller_read_system_time"] = {
    init() {
        this.appendDummyInput()
            .appendField("Hora do sistema de leitura");

        this.setOutput(true, "Number");
        this.setColour(MIHU_CONTROLLER_COLOUR);
    }
};

Blockly.Blocks["mihu_controller_buzzer"] = {
    init() {
        this.appendDummyInput()
            .appendField("definir buzzer")
            .appendField(new Blockly.FieldDropdown([
                ["ON", "ON"],
                ["OFF", "OFF"]
            ]), "STATE");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROLLER_COLOUR);
    }
};

Blockly.Blocks["mihu_controller_in_voltage"] = {
    init() {
        this.appendDummyInput()
            .appendField("Ler analógico");

        this.setOutput(true, "Number");
        this.setColour(MIHU_CONTROLLER_COLOUR);
    }
};

Blockly.Blocks["mihu_controller_audio_frequency"] = {
    init() {
        this.appendDummyInput()
            .appendField("definir frequência de áudio")
            .appendField(new Blockly.FieldDropdown([
                ["Do", "DO"],
                ["Re", "RE"],
                ["Mi", "MI"],
                ["Fa", "FA"],
                ["Sol", "SOL"]
            ]), "NOTE")
            .appendField("Hz")
            .appendField("por")
            .appendField(new Blockly.FieldDropdown([
                ["0,1", "0.1"],
                ["0,25", "0.25"],
                ["0,5", "0.5"],
                ["1", "1"],
                ["2", "2"],
                ["5", "5"]
            ]), "TIME")
            .appendField("s");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MIHU_CONTROLLER_COLOUR);
    }
};

console.log("Blocos controlador MIHU registrados.");
