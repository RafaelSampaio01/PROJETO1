# system/mihuList.py
import uos, sys, gc
from time import sleep_ms, ticks_ms, ticks_diff
from lib import mihuOled as oled
from lib.mihuOled.writer import Writer
from lib.mihuOled.font import font6, font10
from lib.mihuButton.mihuButton import read_fast


# =========================================================
# CONFIG
# =========================================================

ROOT = "/thonnyIDE"
VISIBLE = 3
VIEW_CHARS = 15

SCROLL_START_MS   = 600
SCROLL_STEP_MS    = 220
SCROLL_STEP_CHARS = 1

_DIR_MASK = 0x4000


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
# FILESYSTEM
# =========================================================

def _is_dir(path):
    try:
        return bool(uos.stat(path)[0] & _DIR_MASK)
    except:
        return False


def list_entries(path):
    items = []
    try:
        names = uos.listdir(path)
    except:
        return items

    dirs = []
    pys  = []

    for n in names:
        if n.startswith("."):
            continue
        full = path + "/" + n
        if _is_dir(full):
            dirs.append(n)
        elif n.endswith(".py"):
            pys.append(n)

    dirs.sort(key=str.lower)
    pys.sort(key=str.lower)

    for d in dirs:
        items.append(("dir", d))
    for f in pys:
        items.append(("py", f))

    return items


# =========================================================
# EXECUTAR PY
# =========================================================

def exec_py(fullpath):
    oled.clear()
    Writer.set_textpos(10, 28)
    wri6.printstring("Executando...")
    oled.show()
    sleep_ms(300)

    try:
        dirpath = fullpath.rsplit("/", 1)[0]
        if dirpath not in sys.path:
            sys.path.insert(0, dirpath)

        g = {"__name__": "__main__", "__file__": fullpath}
        with open(fullpath, "r") as f:
            exec(f.read(), g, g)

    except Exception as e:
        oled.clear()
        Writer.set_textpos(0, 28)
        wri6.printstring("Erro:")
        Writer.set_textpos(0, 36)
        wri6.printstring(str(e)[:VIEW_CHARS])
        oled.show()
        sleep_ms(1500)

    try:
        oled.init()
    except:
        pass

    gc.collect()


# =========================================================
# DRAW
# =========================================================

def draw(path, items, selected, top, scroll_ofs):
    oled.clear()

    title = path.replace(ROOT, "") or "/"
    Writer.set_textpos(10, 0)
    wri10.printstring("THONNY " + title[:10])

    for i in range(VISIBLE):
        idx = top + i
        if idx >= len(items):
            break

        kind, name = items[idx]
        suffix = "/" if kind == "dir" else ""
        text = name + suffix
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
# MAIN SCREEN
# =========================================================

def show():
    # ⚠️ MUITO IMPORTANTE
    oled.init()

    global DEV, wri6, wri10, h6

    DEV = _get_dev()
    wri6  = Writer(DEV, font6,  verbose=False)
    wri10 = Writer(DEV, font10, verbose=False)

    Writer.set_clip(col_clip=True, row_clip=True)

    h6 = font6.height()

    path = ROOT
    items = list_entries(path)

    selected = 0
    top = 0
    scroll_ofs = 0

    last_input = ticks_ms()
    last_scroll = ticks_ms()

    while True:
        now = ticks_ms()
        draw(path, items, selected, top, scroll_ofs)

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
            return   # ⬅️ VOLTA PARA O MENU PRINCIPAL

        elif key in ("OK", "ENTER", "A"):
            kind, name = items[selected]
            full = path + "/" + name

            if kind == "dir":
                path = full
                items = list_entries(path)
                selected = 0
                top = 0
            else:
                exec_py(full)

            moved = True

        # -------- Janela vertical --------
        if selected < top:
            top = selected
        if selected >= top + VISIBLE:
            top = selected - (VISIBLE - 1)

        # -------- Scroll horizontal --------
        text = items[selected][1]
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


