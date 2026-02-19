import framebuf
from time import sleep_ms, ticks_ms, ticks_diff

from lib.mihuOled import mihuOled as oled
from lib.mihuOled.icons import icons_menu as menu
from lib.mihuOled.icons import sensor_frames as sensor
from lib.mihuOled.icons import app_frames as app
from lib.mihuOled.icons import thonny_frames as th

from lib.mihuButton.mihuButton import read_menu


oled.init()

W = oled.oled().width
H = oled.oled().height

ICON_W = 48
ICON_H = 48
BUF_SZ = (ICON_W * ICON_H) // 8  # 288

_buf = bytearray(BUF_SZ)
_fb  = framebuf.FrameBuffer(_buf, ICON_W, ICON_H, framebuf.MONO_HLSB)

x0 = (W - ICON_W) // 2
y0 = (H - ICON_H) // 3


ITEMS = [
    ("INICIAR MIXLY",   menu.PLAY_FRAMES),
    ("CONFIGURAR", menu.CONFIG_FRAMES),
    ("ATUADORES",  menu.MOTOR_FRAMES),
    ("SENSORES", sensor.SENSOR_FRAMES),
    ("APP DABBLE",    app.APP_FRAMES),
    ("LISTA THONNY", th.THONNY_FRAMES),
]


def draw_frame_48(frame_bytes, x, y):
    if len(frame_bytes) != BUF_SZ:
        raise ValueError("Frame inválido: esperado %d bytes, veio %d" % (BUF_SZ, len(frame_bytes)))
    _buf[:] = frame_bytes
    oled.oled().blit(_fb, x, y)


# -------------------------------------------------------------------
# IMPORTANTÍSSIMO:
# render_* NÃO limpa a tela. Ele só desenha no offset.
# Quem limpa é:
# - oled.shift_left / shift_right (durante o scroll)
# - oled.clear() quando você desenha “parado”
# -------------------------------------------------------------------
def render_menu(item_idx, frame_idx=0, xoff=0):
    name, frames = ITEMS[item_idx]
    fr = frames[frame_idx % len(frames)]

    draw_frame_48(fr, x0 + xoff, y0)

    tx = max(0, (W - (len(name) * 6)) // 2) + xoff
    oled.text(name, tx, H - 10)


def render_open(item_idx, xoff=0):
    name, frames = ITEMS[item_idx]

    oled.text("ABRIR:", 2 + xoff, 2)
    oled.text(name,     2 + xoff, 14)
    oled.text("OK=enter", 2 + xoff, 34)
    oled.text("BACK=voltar", 2 + xoff, 46)

    draw_frame_48(frames[0], (W - ICON_W - 2) + xoff, 8)


def show_menu(item_idx, frame_idx=0):
    oled.clear()
    render_menu(item_idx, frame_idx, xoff=0)
    oled.show()


def show_open(item_idx):
    oled.clear()
    render_open(item_idx, xoff=0)
    oled.show()


def slide_left(draw_old, draw_new, steps=16, delay_ms=12):
    # shift_left já faz: clear + old(-dx) + new(w-dx)
    oled.shift_left(draw_old, draw_new, steps=steps, delay_ms=delay_ms)


def slide_right(draw_old, draw_new, steps=16, delay_ms=12):
    if hasattr(oled, "shift_right"):
        oled.shift_right(draw_old, draw_new, steps=steps, delay_ms=delay_ms)
    else:
        # fallback (não é perfeito, mas evita “apagar e depois desenhar”)
        oled.shift_left(draw_new, draw_old, steps=steps, delay_ms=delay_ms)


# ===============================
# LOOP
# ===============================
mode = "menu"
idx = 0
frame_i = 0

FRAME_DELAY_MS = 42
t_anim = ticks_ms()

show_menu(idx, frame_i)

while True:
    key = read_menu()  # 1 evento por clique

    if mode == "menu" and key:
        if key in ("LEFT", "UP"):
            old = idx
            idx = (idx + 1) % len(ITEMS)
            frame_i = 0

            def d_old(xoff=0): render_menu(old, 0, xoff=xoff)
            def d_new(xoff=0): render_menu(idx, 0, xoff=xoff)

            slide_left(d_old, d_new)
            show_menu(idx, frame_i)
            t_anim = ticks_ms()

        elif key in ("RIGHT", "DOWN"):
            old = idx
            idx = (idx - 1) % len(ITEMS)
            frame_i = 0

            def d_old(xoff=0): render_menu(old, 0, xoff=xoff)
            def d_new(xoff=0): render_menu(idx, 0, xoff=xoff)

            slide_right(d_old, d_new)
            show_menu(idx, frame_i)
            t_anim = ticks_ms()

        elif key == "OK":
            def d_old(xoff=0): render_menu(idx, 0, xoff=xoff)
            def d_new(xoff=0): render_open(idx, xoff=xoff)
            slide_left(d_old, d_new)

            mode = "open"
            show_open(idx)

    elif mode == "open" and key:
        if key == "BACK":
            def d_old(xoff=0): render_open(idx, xoff=xoff)
            def d_new(xoff=0): render_menu(idx, 0, xoff=xoff)
            slide_right(d_old, d_new)

            mode = "menu"
            frame_i = 0
            show_menu(idx, frame_i)
            t_anim = ticks_ms()

    # animação do ícone no menu
    if mode == "menu":
        now = ticks_ms()
        if ticks_diff(now, t_anim) >= FRAME_DELAY_MS:
            t_anim = now
            frame_i += 1
            show_menu(idx, frame_i)

    sleep_ms(5)
