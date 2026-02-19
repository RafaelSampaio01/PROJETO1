from lib.mihuOled import mihuOled as oled
import framebuf
from time import ticks_ms, ticks_add, ticks_diff, sleep_ms
import machine

# ===============================
# ICONES (seus bytes)
# ===============================
wifi_low = bytes([
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0xfc,0x00,0x02,0x02,
0x00,0x04,0x71,0x00,0x00,0x70,0x00,0x00,0x70,0x00,0x00,0x00,0x00
])

wifi_medio = bytes([
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0x00,0x00,0x00,0x00,0x00,0x03,0xfe,0x00,0x04,0x01,0x00,0x09,0xfc,0x80,0x12,0x02,
0x40,0x04,0x71,0x00,0x00,0x70,0x00,0x00,0x70,0x00,0x00,0x00,0x00
])

wifi_alto = bytes([
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x07,
0xff,0x00,0x08,0x00,0x80,0x13,0xfe,0x40,0x24,0x01,0x20,0x49,0xfc,0x90,0x12,0x02,
0x40,0x04,0x71,0x00,0x00,0x70,0x00,0x00,0x70,0x00,0x00,0x00,0x00
])

fb_wifi_low   = framebuf.FrameBuffer(bytearray(wifi_low),   20, 15, framebuf.MONO_HLSB)
fb_wifi_medio = framebuf.FrameBuffer(bytearray(wifi_medio), 20, 15, framebuf.MONO_HLSB)
fb_wifi_alto  = framebuf.FrameBuffer(bytearray(wifi_alto),  20, 15, framebuf.MONO_HLSB)

# ===============================
# CONFIG
# ===============================
X_WIFI = 0
Y_WIFI = 0
W_WIFI = 20
H_WIFI = 15

ANIM_MS  = 160
BLINK_MS = 180

# limite de atualização da tela (fps) -> 50ms ~ 20fps (bem leve)
SHOW_MIN_MS = 50


def clear_wifi_area():
    oled.fill_rect(X_WIFI, Y_WIFI, W_WIFI, H_WIFI, 0)

def draw_wifi(fb):
    clear_wifi_area()
    oled.draw_icon(fb, X_WIFI, Y_WIFI)


class WifiUI:
    def __init__(self):
        self.frames = [fb_wifi_low, fb_wifi_medio, fb_wifi_alto, fb_wifi_medio]
        self.frame_i = 0
        self.visible = True

        now = ticks_ms()
        self.t_next_frame = ticks_add(now, ANIM_MS)
        self.t_next_blink = ticks_add(now, BLINK_MS)

        self.last_mode = None
        self.last_fb = None
        self.last_visible = None

    def _apply_to_buffer(self, fb, visible):
        # só redesenha se mudou algo (economiza I2C/CPU)
        if fb is self.last_fb and visible == self.last_visible:
            return False

        self.last_fb = fb
        self.last_visible = visible

        if not visible:
            clear_wifi_area()
        else:
            draw_wifi(fb)

        return True  # "sujo" -> precisa show()

    def update(self, mode):
        """
        mode:
          0 = anima + pisca
          1 = low fixo
          2 = medio fixo
          3 = alto fixo
        retorna True se desenhou algo (buffer mudou)
        """
        now = ticks_ms()

        if mode != self.last_mode:
            self.last_mode = mode
            self.frame_i = 0
            self.visible = True
            self.t_next_frame = ticks_add(now, ANIM_MS)
            self.t_next_blink = ticks_add(now, BLINK_MS)
            # força redesenho no primeiro frame do novo modo
            self.last_fb = None
            self.last_visible = None

        if mode == 1:
            return self._apply_to_buffer(fb_wifi_low, True)
        if mode == 2:
            return self._apply_to_buffer(fb_wifi_medio, True)
        if mode == 3:
            return self._apply_to_buffer(fb_wifi_alto, True)

        # mode == 0: anima + pisca
        changed = False

        if ticks_diff(now, self.t_next_frame) >= 0:
            self.frame_i = (self.frame_i + 1) % len(self.frames)
            self.t_next_frame = ticks_add(now, ANIM_MS)
            changed = True

        if ticks_diff(now, self.t_next_blink) >= 0:
            self.visible = not self.visible
            self.t_next_blink = ticks_add(now, BLINK_MS)
            changed = True

        if not changed:
            return False

        fb = self.frames[self.frame_i]
        return self._apply_to_buffer(fb, self.visible)


# ===============================
# MAIN
# ===============================
oled.init()
oled.clear()
oled.text("WIFI", 40, 55)
oled.show()

wifi_ui = WifiUI()

mode = 0  # 0..3
SHOW_MIN_MS = 50

t_next_show = ticks_add(ticks_ms(), SHOW_MIN_MS)
pending_show = True  # força 1º show

while True:
    dirty = wifi_ui.update(mode)

    # LATCH: se desenhou algo, não perde até fazer show()
    if dirty:
        pending_show = True

    now = ticks_ms()
    if pending_show and ticks_diff(now, t_next_show) >= 0:
        oled.show()
        pending_show = False
        t_next_show = ticks_add(now, SHOW_MIN_MS)

    machine.idle()   # ou sleep_ms(1)