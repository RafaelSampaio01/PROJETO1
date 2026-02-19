from time import sleep_ms
from lib.mihuOled import mihuOled as oled
from lib.mihuOled.writer import Writer
from lib.mihuOled.font import font6, font10
from lib.mihuButton.mihuButton import read_fast

# comandos reais do servo
from lib.mihuMotor.mihuServo import setServoAngle, servoOff

# =====================================================
# HELPERS (MESMO PADRÃO DO MOTOR DC)
# =====================================================

def _get_dev():
    for attr in ("oled", "display", "ssd1306", "_oled"):
        if hasattr(oled, attr):
            dev = getattr(oled, attr)
            if hasattr(dev, "width") and hasattr(dev, "height"):
                return dev
    raise RuntimeError("SSD1306 nao encontrado")

# =====================================================
# CONFIG
# =====================================================

SERVOS = ["S1","S2","S3","S4","S5","S6","S7","S8"]
TOTAL = 8

positions = [90] * TOTAL     # posição inicial (graus)

PAGE_SIZE = 4
page = 0                     # 0 = S1–S4 | 1 = S5–S8
selected = 0                 # 0..3 dentro da página

STEP = 5
MIN_POS = 0
MAX_POS = 180

# MESMAS POSIÇÕES DO MOTOR DC
POS = [
    (0,  18),   # 0
    (0,  43),   # 1
    (66, 18),   # 2
    (66, 43)    # 3
]

# =====================================================
# SAFETY
# =====================================================

def stop_all_servos():
    for i in range(TOTAL):
        servoOff(i)

# =====================================================
# DRAW (2x2 IGUAL AO MOTOR DC)
# =====================================================

def draw(DEV, wri6, wri10):
    oled.clear()

    start = page * PAGE_SIZE

    # ---- TÍTULO ----
    Writer.set_textpos(5, 0)
    wri10.printstring(
        "SERVOS {}-{}".format(SERVOS[start], SERVOS[start + 3])
    )

    # ---- GRID ----
    DEV.hline(0, 17, 128, 1)
    DEV.vline(65, 17, 50, 1)
    DEV.hline(0, 42, 128, 1)

    # ---- SERVOS ----
    for i in range(4):
        idx = start + i
        x, y = POS[i]

        label = "{}:{:>3}".format(SERVOS[idx], positions[idx])

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
# MAIN (CHAMADO PELO MENU)
# =====================================================

def show():
    global page, selected

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

        # -------------------------
        # NAVEGAÇÃO
        # -------------------------
        if key == "UP":
            if selected == 0:
                page = (page - 1) % (TOTAL // PAGE_SIZE)
                selected = 3
            else:
                selected -= 1

        elif key == "DOWN":
            if selected == 3:
                page = (page + 1) % (TOTAL // PAGE_SIZE)
                selected = 0
            else:
                selected += 1

        # -------------------------
        # CONTROLE DE ÂNGULO
        # -------------------------
        elif key == "LEFT":
            idx = page * PAGE_SIZE + selected
            positions[idx] = max(MIN_POS, positions[idx] - STEP)
            setServoAngle(idx, positions[idx])

        elif key == "RIGHT":
            idx = page * PAGE_SIZE + selected
            positions[idx] = min(MAX_POS, positions[idx] + STEP)
            setServoAngle(idx, positions[idx])

        # -------------------------
        # SAIR
        # -------------------------
        elif key in ("BACK", "CANCEL"):
            stop_all_servos()
            return   # ⬅️ volta para ATUADORES

        draw(DEV, wri6, wri10)
        sleep_ms(5)
