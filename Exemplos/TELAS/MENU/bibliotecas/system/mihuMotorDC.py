from time import sleep_ms
from lib.mihuOled import mihuOled as oled

from lib.mihuOled.writer import Writer
from lib.mihuOled.font import font6, font10
from lib.mihuButton.mihuButton import read_fast

from lib.mihuMotor.mihuMotor import setMotorPin

# =====================================================
# HELPERS
# =====================================================

def _get_dev():
    # Padrão oficial do projeto MIHU
    if hasattr(oled, "oled"):
        dev = oled.oled()
        if hasattr(dev, "width") and hasattr(dev, "height"):
            return dev
    raise RuntimeError("SSD1306 nao encontrado")


# =====================================================
# CONFIG
# =====================================================

MOTORS = ["M1", "M2", "M3", "M4"]
speeds = [0, 0, 0, 0]

selected = 0
STEP = 5
MIN_VEL = -100
MAX_VEL = 100

POS = [
    (0,  18),
    (0,  43),
    (66, 18),
    (66, 43)
]

# =====================================================
# SAFETY
# =====================================================

def stop_all_motors():
    for i in range(4):
        setMotorPin(i, 0)

# =====================================================
# DRAW
# =====================================================

def draw(DEV, wri6, wri10):
    oled.clear()

    Writer.set_textpos(18, 0)
    wri10.printstring("MOTOR DC")

    DEV.hline(0, 17, 128, 1)
    DEV.vline(65, 17, 50, 1)
    DEV.hline(0, 42, 128, 1)

    for i in range(4):
        x, y = POS[i]
        label = "{}:{:>4}".format(MOTORS[i], speeds[i])

        if i == selected:
            DEV.fill_rect(x, y, 65, 24, 1)
            Writer.set_textpos(x + 6, y + 6)
            wri6.printstring(label, invert=True)
        else:
            DEV.fill_rect(x, y, 65, 24, 0)
            Writer.set_textpos(x + 6, y + 6)
            wri6.printstring(label)

    oled.show()

# =====================================================
# MAIN (chamado pelo menu)
# =====================================================

def show():
    global selected

    DEV = _get_dev()
    wri6  = Writer(DEV, font6,  verbose=False)
    wri10 = Writer(DEV, font10, verbose=False)

    Writer.set_clip(col_clip=True, row_clip=True)

    draw(DEV, wri6, wri10)

    while True:
        key = read_fast()
        if isinstance(key, bytes):
            key = key.decode()
        if isinstance(key, str):
            key = key.strip().upper()

        if key == "UP":
            selected = (selected - 1) % 4

        elif key == "DOWN":
            selected = (selected + 1) % 4

        elif key == "LEFT":
            speeds[selected] = max(MIN_VEL, speeds[selected] - STEP)
            setMotorPin(selected, speeds[selected])

        elif key == "RIGHT":
            speeds[selected] = min(MAX_VEL, speeds[selected] + STEP)
            setMotorPin(selected, speeds[selected])

        elif key in ("BACK", "CANCEL"):
            stop_all_motors()
            return   # volta para ATUADORES

        draw(DEV, wri6, wri10)
        sleep_ms(120)
