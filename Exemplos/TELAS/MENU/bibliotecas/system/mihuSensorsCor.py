from lib.mihuSensors import *
from lib.mihuButton import read_fast
from lib import mihuOled as oled
from lib.writer import Writer
from lib import font6, font10

from time import ticks_ms, ticks_diff, sleep_ms
import math

# =====================================================
# INIT
# =====================================================
oled.init()
startEV3Engine()

DEV = oled.oled()
wri6  = Writer(DEV, font6,  verbose=False)
wri10 = Writer(DEV, font10, verbose=False)
Writer.set_clip(col_clip=True, row_clip=True)

# =====================================================
# PORTAS E MODOS
# =====================================================
PORTS = [P1, P2, P3]
PORT_NAMES = {P1: "P1", P2: "P2", P3: "P3"}

MODES = [REFLEXAO, AMBIENTE, COR]
MODE_NAMES = {
    REFLEXAO: "REFLEXAO",
    AMBIENTE: "AMBIENTE",
    COR:      "COR"
}

port_idx = 0
mode_idx = 0

# =====================================================
# TIMERS
# =====================================================
READ_INTERVAL = 20     # ms
BTN_DEBOUNCE  = 250     # ms

last_read_ms = 0
last_btn_ms  = 0

# =====================================================
# DRAW
# =====================================================
def draw(port, mode, value):
    oled.clear()

    conectado = sensorConectado(port)

    # ----- TÍTULO -----
    Writer.set_textpos(0, 0)
    titulo = "{} - {}".format(PORT_NAMES[port], "OK" if conectado else "LIVRE")
    wri10.printstring(titulo)

    DEV.hline(0, 16, 128, 1)

    # ----- MODO (SETAS NAS PONTAS + TEXTO CENTRAL) -----
    y_mode = 24
    CHAR_W = 6
    SCREEN_W = 128

    mode_txt = MODE_NAMES[mode] if conectado else "---"
    text_w = len(mode_txt) * CHAR_W
    text_x = (SCREEN_W - text_w) // 3

    # seta esquerda (fixa)
    Writer.set_textpos(2, y_mode)
    wri6.printstring("<")

    # texto centralizado
    Writer.set_textpos(text_x, y_mode)
    wri6.printstring(mode_txt)

    # seta direita (fixa)
    Writer.set_textpos(SCREEN_W - 8, y_mode)
    wri6.printstring(">")

    # ----- VALOR -----
    Writer.set_textpos(5, 50)

    if not conectado:
        txt = "---"
    elif value is None or (isinstance(value, float) and math.isnan(value)):
        txt = "..."
    elif mode == COR:
        txt = "{} ({})".format(getColorName(value), int(value))
    else:
        txt = str(value)

    wri6.printstring("V: " + txt)

    oled.show()

# =====================================================
# LOOP PRINCIPAL (NÃO BLOQUEANTE)
# =====================================================
draw(PORTS[port_idx], MODES[mode_idx], None)

while True:
    now = ticks_ms()

    # ---------------- BOTÕES ----------------
    key = read_fast()
    if isinstance(key, bytes):
        key = key.decode()
    if isinstance(key, str):
        key = key.strip().upper()

    if key and ticks_diff(now, last_btn_ms) > BTN_DEBOUNCE:
        last_btn_ms = now
       

        # -------- navegação portas --------
        if key == "UP":
            port_idx = (port_idx - 1) % len(PORTS)

        elif key == "DOWN":
            port_idx = (port_idx + 1) % len(PORTS)

        # -------- navegação modos --------
        elif key in ("RIGHT", "ENTER", "OK"):
            mode_idx = (mode_idx + 1) % len(MODES)

        elif key == "LEFT":
            mode_idx = (mode_idx - 1) % len(MODES)

        # -------- sair --------
        elif key in ("BACK", "CANCEL"):
            oled.clear()
            oled.show()
            break

    # ---------------- SENSOR ----------------
    if ticks_diff(now, last_read_ms) > READ_INTERVAL:
        last_read_ms = now

        port = PORTS[port_idx]
        mode = MODES[mode_idx]

        if sensorConectado(port):
            val = getSensorColor(port, mode)
        else:
            val = None

        draw(port, mode, val)

    sleep_ms(5)
