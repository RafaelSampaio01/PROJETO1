from time import sleep_ms, ticks_ms, ticks_diff
import ujson
import os

from lib.mihuOled import mihuOled as oled
from lib.mihuOled.writer import Writer
from lib.mihuOled.font import font6, font10
from lib.mihuButton.mihuButton import read_fast

# biblioteca REAL de RGB
from lib.mihuLED.mihuRGB import mihuRGBrange, mihuRGBclear


# =========================================================
# CONFIG
# =========================================================
VISIBLE = 3
VIEW_CHARS = 15

SCROLL_START_MS   = 600
SCROLL_STEP_MS    = 220
SCROLL_STEP_CHARS = 1

STATE_FILE = "/rgb_state.json"   # <<< FLASH

# Lista de cores (nome, R, G, B)
COLORS = [
    ("DESLIGADO",  0,   0,   0),
    ("VERMELHO",   255, 0,   0),
    ("VERDE",      0,   255, 0),
    ("AZUL",       0,   0,   255),
    ("AMARELO",    255, 255, 0),
    ("CIANO",      0,   255, 255),
    ("MAGENTA",    255, 0,   255),
    ("BRANCO",     255, 255, 255),
    ("LARANJA",    255, 128, 0),
    ("ROXO",       128, 0,   128),
    ("ROSA",       255, 105, 180),
]

BRILHO_PADRAO = 100   # 0–60 conforme sua lib


# =========================================================
# FLASH HELPERS
# =========================================================
def load_state():
    try:
        with open(STATE_FILE, "r") as f:
            data = ujson.load(f)
            idx = int(data.get("selected", 0))
            if 0 <= idx < len(COLORS):
                return idx
    except:
        pass
    return 0


def save_state(selected):
    try:
        with open(STATE_FILE, "w") as f:
            ujson.dump({"selected": selected}, f)
    except:
        pass


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
# DRAW
# =========================================================
def draw(items, selected, top, scroll_ofs):
    oled.clear()

    # ---- TÍTULO ----
    Writer.set_textpos(10, 0)
    wri10.printstring("LED RGB")

    # ---- LISTA ----
    for i in range(VISIBLE):
        idx = top + i
        if idx >= len(items):
            break

        text = items[idx][0]
        y = 14 + i * h6

        if idx == selected:
            DEV.fill_rect(0, y, DEV.width - 10, h6, 1)
            shown = text[scroll_ofs:scroll_ofs + VIEW_CHARS]
            Writer.set_textpos(2, y)
            wri6.printstring(shown, invert=True)
        else:
            Writer.set_textpos(2, y)
            wri6.printstring(text[:VIEW_CHARS])

    # ---- SCROLLBAR ----
    if len(items) > VISIBLE:
        SB_W = 6
        SB_X = DEV.width - SB_W
        track_h = VISIBLE * h6

        DEV.rect(SB_X, 14, SB_W, track_h, 1)

        thumb_h = max(8, int(track_h * VISIBLE / len(items)))
        max_top = len(items) - VISIBLE
        thumb_y = 14 + int((track_h - thumb_h) * top / max_top)

        DEV.fill_rect(SB_X + 1, thumb_y, SB_W - 2, thumb_h, 1)

    oled.show()


# =========================================================
# MAIN
# =========================================================
def show():
    global DEV, wri6, wri10, h6

    DEV = _get_dev()
    wri6  = Writer(DEV, font6,  verbose=False)
    wri10 = Writer(DEV, font10, verbose=False)

    Writer.set_clip(col_clip=True, row_clip=True)
    h6 = font6.height()

    items = COLORS

    # 🔹 CARREGA ÚLTIMA COR DA FLASH
    selected = load_state()
    top = max(0, min(selected, len(items) - VISIBLE))
    scroll_ofs = 0

    last_input = ticks_ms()
    last_scroll = ticks_ms()

    # 🔹 APLICA COR SALVA AO ENTRAR
    _, r, g, b = items[selected]
    mihuRGBrange(0, 29, r, g, b, BRILHO_PADRAO)

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
            save_state(selected)   # <<< SALVA AO SAIR
            return

        # -------- Atualiza LED e salva --------
        if moved:
            _, r, g, b = items[selected]
            mihuRGBrange(0, 29, r, g, b, BRILHO_PADRAO)
            save_state(selected)   # <<< SALVA A CADA MUDANÇA

        # -------- Janela vertical --------
        if selected < top:
            top = selected
        if selected >= top + VISIBLE:
            top = selected - (VISIBLE - 1)

        # -------- Scroll horizontal --------
        text = items[selected][0]
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
