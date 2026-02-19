# system/mihuAtuadores.py
from time import sleep_ms, ticks_ms, ticks_diff
from lib import mihuOled as oled
from lib.writer import Writer
from lib import font6, font10
from lib.mihuButton import read_fast


from system.mihuSensorsCor import show as EST_show 

# =========================================================
# CONFIG
# =========================================================

VISIBLE = 3
VIEW_CHARS = 15

SCROLL_START_MS   = 600
SCROLL_STEP_MS    = 220
SCROLL_STEP_CHARS = 1

# =========================================================
# OLED DEVICE
# =========================================================

def _get_dev():
    for attr in ("oled", "display", "ssd1306", "_oled"):
        if hasattr(oled, attr):
            dev = getattr(oled, attr)
            if hasattr(dev, "width") and hasattr(dev, "height"):
                return dev
    raise RuntimeError("SSD1306 nao encontrado")

# =========================================================
# ITENS DO SUBMENU
# =========================================================

ATUADORES = [
    {"label": "SENSOR DE COR",        "action": None},
    {"label": "SENSOR ULTRASSONICO",   "action": None},
    {"label": "SENSOR DE GIROSCOPIO", "action": None},
    {"label": "SENSOR DE TOQUE","action": None},
    {"label": "SENSOR DE TEMPERATURA","action": None},
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

def draw(items, selected, top, scroll_ofs):
    oled.clear()

    # ---- TÍTULO ----
    Writer.set_textpos(5, 0)
    wri10.printstring("SENSOR EST")

    # ---- LISTA ----
    for i in range(VISIBLE):
        idx = top + i
        if idx >= len(items):
            break

        text = items[idx]["label"]
        y = 14 + i * h6

        if idx == selected:
            DEV.fill_rect(0, y, DEV.width - 10, h6, 1)
            shown = text[scroll_ofs:scroll_ofs + VIEW_CHARS]
            Writer.set_textpos(2, y)
            wri6.printstring(shown, invert=True)
        else:
            Writer.set_textpos(2, y)
            wri6.printstring(text[:VIEW_CHARS])

    draw_scrollbar(
        DEV,
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
    # ❗ NÃO CHAMA oled.init() AQUI ❗

    global DEV, wri6, wri10, h6

    DEV = _get_dev()
    wri6  = Writer(DEV, font6,  verbose=False)
    wri10 = Writer(DEV, font10, verbose=False)

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
        draw(items, selected, top, scroll_ofs)

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
            return   # ⬅️ volta para menu principal (sem limpar OLED)

        elif key in ("OK", "ENTER", "A"):
            action = items[selected].get("action")
            if callable(action):
                action()   # entra no menu filho
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

        sleep_ms(5)


