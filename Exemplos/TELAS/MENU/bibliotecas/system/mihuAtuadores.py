# =========================================================
# IMPORTS
# =========================================================
from time import sleep_ms, ticks_ms, ticks_diff

from lib.mihuOled import mihuOled as oled
from lib.mihuOled.writer import Writer
from lib.mihuOled.font import font6, font10

from lib.mihuButton.mihuButton import read_fast

from system.mihuMotorDC import show as motor_dc_show
from system.mihuServo import show as servo_show
from system.mihuLedRGB import show as led_rgb_show
from system.mihuLedIR import show as led_ir_show


# =========================================================
# CONFIG
# =========================================================
VISIBLE = 3
VIEW_CHARS = 15

SCROLL_START_MS   = 600
SCROLL_STEP_MS    = 220
SCROLL_STEP_CHARS = 1


# =========================================================
# ITENS DO SUBMENU
# =========================================================
ATUADORES = [
    {"label": "MOTOR DC",          "action": motor_dc_show},
    {"label": "SERVO MOTORES",     "action": servo_show},
    {"label": "LED RGB",           "action": led_rgb_show},
    {"label": "LED INFRAVERMELHO", "action": led_ir_show},
]


# =========================================================
# SCROLLBAR
# =========================================================
def draw_scrollbar(dev, top, visible, total, y0, y1):
    if total <= visible:
        return

    SB_W = 6
    SB_X = dev.width - SB_W
    track_h = y1 - y0

    dev.fill_rect(SB_X, y0, SB_W, track_h, 0)
    dev.rect(SB_X, y0, SB_W, track_h, 1)

    thumb_h = max(8, int(track_h * visible / total))
    max_top = total - visible
    thumb_y = y0 + int((track_h - thumb_h) * top / max_top)

    dev.fill_rect(SB_X + 1, thumb_y, SB_W - 2, thumb_h, 1)


# =========================================================
# DRAW
# =========================================================
def draw(dev, wri6, wri10, h6, items, selected, top, scroll_ofs):
    oled.clear()

    # ---- TÍTULO ----
    Writer.set_textpos(0, 0)
    wri10.printstring("ATUADORES")

    # ---- LISTA ----
    for i in range(VISIBLE):
        idx = top + i
        if idx >= len(items):
            break

        text = items[idx]["label"]
        y = 14 + i * h6

        if idx == selected:
            dev.fill_rect(0, y, dev.width - 10, h6, 1)
            shown = text[scroll_ofs:scroll_ofs + VIEW_CHARS]
            Writer.set_textpos(2, y)
            wri6.printstring(shown, invert=True)
        else:
            Writer.set_textpos(2, y)
            wri6.printstring(text[:VIEW_CHARS])

    draw_scrollbar(
        dev,
        top,
        VISIBLE,
        len(items),
        14,
        14 + VISIBLE * h6
    )

    oled.show()


# =========================================================
# MAIN SCREEN
# =========================================================
def show():
    """
    Tela de ATUADORES
    Retorna ao menu principal quando BACK é pressionado
    """

    # 🔑 DISPLAY REAL (CORRETO PARA SUA LIB)
    dev = oled.oled()

    # Writers
    wri6  = Writer(dev, font6,  verbose=False)
    wri10 = Writer(dev, font10, verbose=False)

    Writer.set_clip(col_clip=True, row_clip=True)
    h6 = font6.height()

    items = ATUADORES
    selected = 0
    top = 0
    scroll_ofs = 0

    last_input = ticks_ms()
    last_scroll = ticks_ms()

    while True:
        now = ticks_ms()

        draw(dev, wri6, wri10, h6, items, selected, top, scroll_ofs)

        key = read_fast()
        if isinstance(key, bytes):
            key = key.decode()
        if isinstance(key, str):
            key = key.strip().upper()

        moved = False

        # -------- Navegação --------
        if key in ("UP", "LEFT"):
            selected = (selected - 1) % len(items)
            moved = True

        elif key in ("DOWN", "RIGHT"):
            selected = (selected + 1) % len(items)
            moved = True

        elif key in ("BACK", "CANCEL"):
            return  # 🔙 volta para menu principal

        elif key in ("OK", "ENTER", "A"):
            action = items[selected].get("action")
            if callable(action):
                action()   # entra no submenu
            moved = True

        # -------- Janela vertical --------
        if selected < top:
            top = selected
        if selected >= top + VISIBLE:
            top = selected - (VISIBLE - 1)

        # -------- Scroll horizontal --------
        text = items[selected]["label"]
        max_scroll = max(0, len(text) - VIEW_CHARS)

        if moved:
            scroll_ofs = 0
            last_input = now
            last_scroll = now

        elif max_scroll > 0:
            if ticks_diff(now, last_input) > SCROLL_START_MS:
                if ticks_diff(now, last_scroll) > SCROLL_STEP_MS:
                    last_scroll = now
                    scroll_ofs += SCROLL_STEP_CHARS
                    if scroll_ofs > max_scroll:
                        scroll_ofs = 0

        sleep_ms(10)
