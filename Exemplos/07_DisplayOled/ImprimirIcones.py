# system/mihuLedIR.py
from time import sleep_ms
from machine import Pin

from lib.mihuOled import mihuOled as oled
from lib.mihuOled.writer import Writer
from lib.mihuOled.font import font6, font10
from lib.mihuButton.mihuButton import read_fast

# Ícones (podem ser PBM ou RAW)
from lib.mihuOled.icons.object_picture import Light_on, Light_off


# =========================================================
# CONFIG LED IR
# =========================================================
IR_PIN = 4
_ir = Pin(IR_PIN, Pin.OUT)
_ir_state = False   # False = desligado | True = ligado


# =========================================================
# CONFIG ÍCONE (usado apenas se for RAW)
# =========================================================
ICON_W = 32   # ajuste se necessário
ICON_H = 32   # ajuste se necessário


# =========================================================
# HELPER — desenha PBM ou RAW automaticamente
# =========================================================
def draw_any_icon(icon, x, y, w=None, h=None):
    """
    Desenha automaticamente ícones:
    - PBM (P4)  -> oled.draw_pbm()
    - RAW bytes -> oled.draw_icon(buf, x, y, w, h)
    """

    # garante buffer válido
    if not isinstance(icon, (bytes, bytearray, memoryview)):
        icon = bytearray(icon)

    # PBM (P4)
    if icon[:2] == b"P4":
        oled.draw_pbm(icon, x, y)
        return

    # RAW
    if w is None or h is None:
        raise ValueError("Ícone RAW precisa de largura e altura (w/h)")

    oled.draw_icon(icon, x, y, w, h)


# =========================================================
# DRAW
# =========================================================
def draw(DEV, wri6, wri10, state):
    oled.clear()

    # ---- TÍTULO ----
    Writer.set_textpos(18, 0)
    wri10.printstring("LED IR")

    # ---- LINHA ----
    DEV.hline(0, 17, 128, 1)

    # ---- ÍCONE ----
    icon = Light_on if state else Light_off

    # posição base (PBM já carrega tamanho no header)
    icon_x = 48
    icon_y = 18

    draw_any_icon(icon, icon_x, icon_y, ICON_W, ICON_H)

    # ---- STATUS ----
    label = "LIGADO" if state else "DESLIGADO"
    Writer.set_textpos(0, icon_y + ICON_H + 2)
    wri6.printstring(label, invert=True)

    oled.show()


# =========================================================
# MAIN (CHAMADO PELO MENU ATUADORES)
# =========================================================
def show():
    global _ir_state

    DEV = oled.oled()
    wri6  = Writer(DEV, font6,  verbose=False)
    wri10 = Writer(DEV, font10, verbose=False)

    Writer.set_clip(col_clip=True, row_clip=True)

    # estado inicial seguro
    _ir_state = False
    _ir.value(0)

    draw(DEV, wri6, wri10, _ir_state)

    while True:
        key = read_fast()

        if isinstance(key, bytes):
            key = key.decode()

        if isinstance(key, str):
            key = key.strip().upper()

        # qualquer direcional alterna o LED IR
        if key in ("UP", "DOWN", "LEFT", "RIGHT"):
            _ir_state = not _ir_state
            _ir.value(1 if _ir_state else 0)
            draw(DEV, wri6, wri10, _ir_state)

        elif key in ("BACK", "CANCEL"):
            _ir.value(0)   # segurança: desliga ao sair
            return

        sleep_ms(80)



