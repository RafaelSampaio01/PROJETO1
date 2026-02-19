from lib.mihuOled import mihuOled as oled
import framebuf
import network
import machine
from time import ticks_ms, ticks_add, ticks_diff

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
# CONFIG OLED + ANIMA
# ===============================
X_WIFI, Y_WIFI, W_WIFI, H_WIFI = 0, 0, 20, 15
ANIM_MS  = 160
BLINK_MS = 180
SHOW_MIN_MS = 50   # 20 fps máx

# ===============================
# WIFI CONFIG (AJUSTE)
# ===============================
SSID = "moto g05"
PASS = "1234567890"

# ===============================
# FUNÇÕES BASE
# ===============================
def clear_wifi_area():
    oled.fill_rect(X_WIFI, Y_WIFI, W_WIFI, H_WIFI, 0)

def draw_wifi(fb):
    clear_wifi_area()
    oled.draw_icon(fb, X_WIFI, Y_WIFI)

def draw_status_text(msg):
    # limpa uma faixa embaixo e escreve
    oled.fill_rect(0, 52, 128, 12, 0)
    oled.text(msg, 0, 55)

# ===============================
# UI WIFI (0..3)
# ===============================
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
        if fb is self.last_fb and visible == self.last_visible:
            return False
        self.last_fb = fb
        self.last_visible = visible

        if not visible:
            clear_wifi_area()
        else:
            draw_wifi(fb)
        return True

    def update(self, mode):
        now = ticks_ms()

        if mode != self.last_mode:
            self.last_mode = mode
            self.frame_i = 0
            self.visible = True
            self.t_next_frame = ticks_add(now, ANIM_MS)
            self.t_next_blink = ticks_add(now, BLINK_MS)
            self.last_fb = None
            self.last_visible = None

        if mode == 1:
            return self._apply_to_buffer(fb_wifi_low, True)
        if mode == 2:
            return self._apply_to_buffer(fb_wifi_medio, True)
        if mode == 3:
            return self._apply_to_buffer(fb_wifi_alto, True)

        # mode 0
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

        return self._apply_to_buffer(self.frames[self.frame_i], self.visible)

# ===============================
# WIFI REAL
# ===============================
wlan = network.WLAN(network.STA_IF)
wlan.active(True)

def wifi_connect_nonblock():
    # chama 1 vez; a conexão continua em background
    if not wlan.isconnected():
        try:
            wlan.connect(SSID, PASS)
        except:
            pass

def rssi_to_mode(rssi):
    # ajuste os thresholds se quiser
    if rssi is None:
        return 1
    if rssi >= -60:
        return 3
    if rssi >= -75:
        return 2
    return 1

def get_rssi_safe():
    try:
        return wlan.status("rssi")
    except:
        return None

# ===============================
# MAIN
# ===============================
oled.init()
oled.clear()
oled.text("WIFI", 40, 55)
oled.show()

wifi_ui = WifiUI()

t_next_show = ticks_add(ticks_ms(), SHOW_MIN_MS)
pending_show = True

t_next_wifi_check = ticks_add(ticks_ms(), 300)  # checa wifi 3x por segundo
mode = 0
last_connected = None

wifi_connect_nonblock()

while True:
    now = ticks_ms()

    # checagem real do wifi (limitada)
    if ticks_diff(now, t_next_wifi_check) >= 0:
        t_next_wifi_check = ticks_add(now, 300)

        connected = False
        try:
            connected = wlan.isconnected()
        except:
            connected = False

        if not connected:
            mode = 0
            wifi_connect_nonblock()
            if last_connected is not False:
                draw_status_text("SEM WIFI")
                pending_show = True
            last_connected = False
        else:
            rssi = get_rssi_safe()
            mode = rssi_to_mode(rssi)
            if last_connected is not True:
                draw_status_text("CONECTADO")
                pending_show = True
            last_connected = True

    # atualiza o ícone conforme modo 0..3
    dirty = wifi_ui.update(mode)
    if dirty:
        pending_show = True

    # show com latch + limite de fps
    if pending_show and ticks_diff(now, t_next_show) >= 0:
        oled.show()
        pending_show = False
        t_next_show = ticks_add(now, SHOW_MIN_MS)

    machine.idle()
