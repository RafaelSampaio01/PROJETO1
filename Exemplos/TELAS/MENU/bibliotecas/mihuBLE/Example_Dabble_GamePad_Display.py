from time import sleep_ms
from lib.mihuBLE.DABBLE import DabbleGamePad
from lib.mihuOled import mihuOled as oled
from lib.mihuOled.icons import informatio_picture

# =====================================================
# ÍCONES
# =====================================================

ICONS = {
    "FRENTE":   informatio_picture.Forward,
    "TRAS":     informatio_picture.Backward,
    "ESQUERDA": informatio_picture.Left,
    "DIREITA":  informatio_picture.Right,
    "PARAR":    informatio_picture.Stop_2,
}

# =====================================================
# OLED
# =====================================================

def show_icon(pbm):
    oled.clear()
    oled.draw_pbm(pbm, 20, 0)  # posição fixa
    oled.show()

oled.init()
oled.clear()
oled.show()

# =====================================================
# GAMEPAD
# =====================================================

pad = DabbleGamePad("MIHU-001")

print("🎮 Controle do Robô Iniciado")

estado_atual = None   # evita redesenho repetido

# =====================================================
# LOOP PRINCIPAL
# =====================================================

while True:
    if pad.any() and pad.update():

        novo_estado = None

        # -------------------------------
        # DIREÇÕES
        # -------------------------------
        if pad.is_up():
            novo_estado = "FRENTE"
            print("🚗 FRENTE")

        elif pad.is_down():
            novo_estado = "TRAS"
            print("🔙 TRÁS")

        elif pad.is_left():
            novo_estado = "ESQUERDA"
            print("⬅️ ESQUERDA")

        elif pad.is_right():
            novo_estado = "DIREITA"
            print("➡️ DIREITA")

        else:
            novo_estado = "PARAR"
            print("⏹ PARAR")

        # -------------------------------
        # ATUALIZA OLED APENAS SE MUDAR
        # -------------------------------
        if novo_estado != estado_atual:
            show_icon(ICONS[novo_estado])
            estado_atual = novo_estado

        # -------------------------------
        # BOTÕES (INDEPENDENTES)
        # -------------------------------
        if pad.is_cross():
            print("❌ BOTÃO X")

    sleep_ms(30)
