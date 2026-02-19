from time import sleep_ms, ticks_ms, ticks_diff
from lib import mihuOled as oled
from lib.writer import Writer
from lib import font6, font10
from lib.mihuButton import read_fast


# --------------------------------
# Descobre o device real do OLED
# --------------------------------
def _get_dev():
    for attr in ("oled", "display", "ssd1306", "_oled"):
        if hasattr(oled, attr):
            dev = getattr(oled, attr)
            if hasattr(dev, "width") and hasattr(dev, "height"):
                return dev
    raise RuntimeError("Display SSD1306 nao encontrado")


# --------------------------------
# Scrollbar vertical (lado direito)
# --------------------------------
def draw_scrollbar(dev, top, visible, total, y0, y1):
    if total <= visible:
        return

    SB_W = 6
    SB_X = dev.width - SB_W
    track_h = y1 - y0

    # trilho
    dev.fill_rect(SB_X, y0, SB_W, track_h, 0)
    dev.rect(SB_X, y0, SB_W, track_h, 1)

    # thumb
    thumb_h = max(8, int(track_h * visible / total))
    max_top = total - visible
    thumb_y = y0 + int((track_h - thumb_h) * top / max_top)

    dev.fill_rect(SB_X + 1, thumb_y, SB_W - 2, thumb_h, 1)


# --------------------------------
# Inicialização
# --------------------------------
oled.init()
DEV = _get_dev()

wri6  = Writer(DEV, font6,  verbose=False)
wri10 = Writer(DEV, font10, verbose=False)

# 🔒 impede quebra automática de linha
Writer.set_clip(col_clip=True, row_clip=True)

h6  = font6.height()
h10 = font10.height()


# --------------------------------
# Layout
# --------------------------------
TITLE_X = 10
TITLE_Y = 0

LIST_X  = 0
LIST_Y0 = h10 + 2

VISIBLE = 3
LINE_W  = DEV.width - 10


# --------------------------------
# Scroll horizontal (parâmetros UX)
# --------------------------------
VIEW_CHARS        = 15
SCROLL_START_MS   = 600     # espera antes de começar
SCROLL_STEP_MS    = 220     # velocidade do scroll
SCROLL_STEP_CHARS = 1


# --------------------------------
# Itens do menu
# --------------------------------
ITEMS = [
    "MOTOR DC",
    "SERVO DE ROTACAO CONTINUA",
    "LED RGB ENDERECAVEL DE ALTA POTENCIA",
    "RELE",
    "BUZZER",
    "VENTOINHA 12V"
]


# --------------------------------
# Estado do scroll
# --------------------------------
scroll_ofs  = 0
last_input  = ticks_ms()
last_scroll = ticks_ms()


# --------------------------------
# Desenho da tela
# --------------------------------
def draw(selected, top):
    oled.clear()

    # ----- TÍTULO -----
    Writer.set_textpos(TITLE_X, TITLE_Y)
    wri10.printstring("ATUADORES")

    # ----- LISTA -----
    for i in range(VISIBLE):
        idx = top + i
        if idx >= len(ITEMS):
            break

        y = LIST_Y0 + i * h6
        text = ITEMS[idx]

        if idx == selected:
            DEV.fill_rect(0, y, LINE_W, h6, 1)
            shown = text[scroll_ofs:scroll_ofs + VIEW_CHARS]
            Writer.set_textpos(LIST_X + 2, y)
            wri6.printstring(shown, invert=True)
        else:
            Writer.set_textpos(LIST_X + 2, y)
            wri6.printstring(text[:VIEW_CHARS])

    draw_scrollbar(
        DEV,
        top=top,
        visible=VISIBLE,
        total=len(ITEMS),
        y0=LIST_Y0,
        y1=LIST_Y0 + VISIBLE * h6
    )

    oled.show()


# --------------------------------
# Loop principal (NÃO BLOQUEANTE)
# --------------------------------
def show():
    global scroll_ofs, last_input, last_scroll

    selected = 0
    top = 0

    while True:
        now = ticks_ms()
        draw(selected, top)

        key = read_fast()
        if isinstance(key, bytes):
            key = key.decode()
        if isinstance(key, str):
            key = key.strip().upper()

        moved = False

        # -------- Navegação --------
        if key in ("UP", "LEFT"):
            selected = (selected - 1) % len(ITEMS)
            moved = True

        elif key in ("DOWN", "RIGHT"):
            selected = (selected + 1) % len(ITEMS)
            moved = True

        elif key in ("BACK", "CANCEL"):
            return

        elif key in ("OK", "ENTER", "A"):
            oled.clear()
            Writer.set_textpos(5, 30)
            wri6.printstring("OK: " + ITEMS[selected])
            oled.show()
            sleep_ms(600)
            moved = True

        # -------- Janela vertical --------
        if selected < top:
            top = selected
        if selected >= top + VISIBLE:
            top = selected - (VISIBLE - 1)

        # -------- Scroll horizontal --------
        text = ITEMS[selected]
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


# --------------------------------
# Executa
# --------------------------------
show()
