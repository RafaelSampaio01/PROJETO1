import framebuf
from time import sleep_ms

from lib.mihuOled import mihuOled as oled
from lib.mihuOled.icons import icons_menu as ic  # pasta: lib.mihuOled.icons.icons_menu
from lib.mihuOled.icons import sensor_frames as ic  # pasta: lib.mihuOled.icons.icons_menu


oled.init()

ICON_W = 48
ICON_H = 48
BUF_SZ = (ICON_W * ICON_H) // 8  # 288

# buffer único (mutável) + framebuffer único
_buf = bytearray(BUF_SZ)
_fb  = framebuf.FrameBuffer(_buf, ICON_W, ICON_H, framebuf.MONO_HLSB)

def draw_frame(frame_bytes, x, y):
    # garante tamanho correto
    if len(frame_bytes) != BUF_SZ:
        raise ValueError("Frame inválido: esperado %d bytes, veio %d" % (BUF_SZ, len(frame_bytes)))

    # copia o conteúdo do frame para o buffer mutável
    _buf[:] = frame_bytes

    # desenha
    oled.oled().blit(_fb, x, y)

def animate(frames, x, y, delay_ms=42, loops=0, clear_each=True):
    # loops=0 => infinito
    while True:
        for fr in frames:
            if clear_each:
                oled.clear()

            draw_frame(fr, x, y)
            oled.show()
            sleep_ms(delay_ms)

        if loops:
            loops -= 1
            if loops <= 0:
                break

# Centralizado em 128x64
x0 = (oled.oled().width  - ICON_W) // 2   # (128-48)//2 = 40
y0 = (oled.oled().height - ICON_H) // 2   # (64-48)//2  = 8

# Exemplo: animação PLAY (ajuste o nome conforme seu arquivo icons_menu)
animate(ic.PLAY_FRAMES, x0, y0, delay_ms=42, loops=2)
animate(ic.CONFIG_FRAMES, x0, y0, delay_ms=42, loops=2)
animate(ic.MOTOR_FRAMES, x0, y0, delay_ms=42, loops=2) 
#animate(ic.THONNY_FRAMES, x0, y0, delay_ms=42, loops=2)