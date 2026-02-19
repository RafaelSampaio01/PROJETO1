import framebuf
from time import sleep_ms, ticks_ms, ticks_diff
import machine

from lib.mihuOled import mihuOled as oled
from lib.mihuOled.icons import icons_menu as menu
from lib.mihuOled.icons import sensor_frames as sensor
from lib.mihuOled.icons import thonny_frames as th
from lib.mihuOled.icons import app_frames as app

from lib.mihuButton.mihuButton import read_menu
from system.wifi_widget import WifiWidget
from system.mihuAtuadores import show as atuadores_show

# =========================================================
# INIT OLED
# =========================================================
oled.init()
oled.clear()
oled.show()

sleep_ms(400)

W = oled.oled().width
H = oled.oled().height

sleep_ms(400)

# =========================================================
# WIFI
# =========================================================
wifi_ui = WifiWidget(oled, x=0, y=0)
wifi_ui.set_credentials("moto g05", "1234567890")
sleep_ms(300)
wifi_ui.set_enabled(True)

# =========================================================
# BLE (SEGURO / OPCIONAL)
# =========================================================
ble = None
ble_connected = False

try:
    from lib.mihuBLE import mihuBLE
    print("🔵 Iniciando BLE...")
    mihuBLE.start("MIHU_001")
    ble = mihuBLE
except Exception as e:
    print("⚠️ BLE desativado:", e)
    ble = None

# =========================================================
# ICONES 48x48
# =========================================================
ICON_W = 48
ICON_H = 48
BUF_SZ = (ICON_W * ICON_H) // 8

_buf = bytearray(BUF_SZ)
_fb  = framebuf.FrameBuffer(_buf, ICON_W, ICON_H, framebuf.MONO_HLSB)

ICON_X = (W - ICON_W) // 2
ICON_Y = (H - ICON_H) // 3 - 2

# =========================================================
# ITENS DO MENU
# =========================================================
ITEMS = [
    ("INICIAR O MIXLY",   menu.PLAY_FRAMES),
    ("CONFIGURAR",       menu.CONFIG_FRAMES),
    ("ATUADORES",        menu.MOTOR_FRAMES),
    ("SENSORES",         sensor.SENSOR_FRAMES),
    ("APP DABBLE",       app.APP_FRAMES),
    ("LISTA DO THONNY",  th.THONNY_FRAMES),
]

# =========================================================
# SCROLL DE TEXTO
# =========================================================
_SCROLL = {"text": "", "offset": 0, "width": 0, "gap": 16}

def text_width(txt):
    return len(txt) * 8

def scroll_set(text):
    _SCROLL["text"] = text
    _SCROLL["offset"] = 0
    _SCROLL["width"] = text_width(text)

def scroll_tick(speed=1):
    if _SCROLL["width"] <= W:
        return
    total = _SCROLL["width"] + _SCROLL["gap"]
    _SCROLL["offset"] = (_SCROLL["offset"] + speed) % total

def draw_label(y):
    oled.fill_rect(0, y, W, 8, 0)
    text = _SCROLL["text"]
    tw = _SCROLL["width"]

    if tw <= W:
        oled.text(text, (W - tw) // 2, y)
        return

    ox = _SCROLL["offset"]
    oled.text(text, -ox, y)
    oled.text(text, -ox + tw + _SCROLL["gap"], y)

# =========================================================
# DESENHO DO ÍCONE
# =========================================================
def draw_frame_48(frame_bytes, x, y):
    _buf[:] = frame_bytes
    oled.oled().blit(_fb, x, y)

def clear_icon_area():
    oled.fill_rect(ICON_X, ICON_Y, ICON_W, ICON_H, 0)

# =========================================================
# RENDER
# =========================================================
def render_menu(item_idx, frame_idx=0):
    name, frames = ITEMS[item_idx]
    clear_icon_area()
    draw_frame_48(frames[frame_idx % len(frames)], ICON_X, ICON_Y)

def render_open(item_idx):
    oled.fill_rect(0, 16, W, H - 16, 0)
    name, frames = ITEMS[item_idx]
    oled.text("ABRIR:", 2, 18)
    oled.text(name, 2, 28)
    oled.text("OK=enter", 2, 42)
    oled.text("BACK=voltar", 2, 52)
    draw_frame_48(frames[0], W - ICON_W - 2, 20)

# =========================================================
# SHIFT (SEM ALTERAR)
# =========================================================
def shift_left_safe(draw_old, draw_new):
    oled.shift_left(draw_old, draw_new, steps=16, delay_ms=12)

def shift_right_safe(draw_old, draw_new):
    if hasattr(oled, "shift_right"):
        oled.shift_right(draw_old, draw_new, steps=16, delay_ms=12)
    else:
        oled.shift_left(draw_new, draw_old, steps=16, delay_ms=12)

# =========================================================
# LOOP PRINCIPAL
# =========================================================
mode = "menu"
idx = 0
frame_i = 0

FRAME_DELAY_MS  = 42
SCROLL_DELAY_MS = 40

t_anim   = ticks_ms()
t_scroll = ticks_ms()

scroll_set(ITEMS[idx][0])
render_menu(idx, frame_i)
draw_label(H - 10)
wifi_ui.update(ticks_ms())
oled.show()

while True:
    now = ticks_ms()
    dirty = False
    key = read_menu()

    # ---------------- BLE ----------------
    if ble:
        try:
            ble_connected = ble.connected()
            cmd = ble.recv()
            if cmd:
                if isinstance(cmd, bytes):
                    cmd = cmd.decode()
                print("BLE CMD:", cmd.strip())
        except:
            ble_connected = False

    # ---------------- MENU ----------------
    if mode == "menu" and key:
        old = idx

        if key in ("LEFT", "UP"):
            idx = (idx + 1) % len(ITEMS)

        elif key in ("RIGHT", "DOWN"):
            idx = (idx - 1) % len(ITEMS)

        elif key == "OK":
            if idx == 2:
                oled.clear()
                oled.show()
                atuadores_show()

                oled.clear()
                scroll_set(ITEMS[idx][0])
                render_menu(idx, frame_i)
                draw_label(H - 10)
                wifi_ui.update(ticks_ms())
                oled.show()
                continue

            shift_left_safe(
                lambda: (render_menu(idx, 0), draw_label(H - 10)),
                lambda: render_open(idx)
            )
            mode = "open"
            oled.show()
            continue

        if idx != old:
            scroll_set(ITEMS[idx][0])
            frame_i = 0
            shift_left_safe(
                lambda: (render_menu(old, 0), draw_label(H - 10)),
                lambda: (render_menu(idx, 0), draw_label(H - 10))
            )
            dirty = True

    elif mode == "open" and key == "BACK":
        shift_right_safe(
            lambda: render_open(idx),
            lambda: (render_menu(idx, 0), draw_label(H - 10))
        )
        mode = "menu"
        scroll_set(ITEMS[idx][0])
        dirty = True

    # ---------------- ANIMAÇÕES ----------------
    if mode == "menu" and ticks_diff(now, t_anim) >= FRAME_DELAY_MS:
        t_anim = now
        frame_i += 1
        render_menu(idx, frame_i)
        draw_label(H - 10)
        dirty = True

    if mode == "menu" and ticks_diff(now, t_scroll) >= SCROLL_DELAY_MS:
        t_scroll = now
        scroll_tick(1)
        draw_label(H - 10)
        dirty = True

    dirty |= wifi_ui.update(now)

    if dirty:
        oled.show()

    machine.idle()
    sleep_ms(5)
