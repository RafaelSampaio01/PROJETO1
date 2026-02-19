from time import ticks_ms, ticks_add, ticks_diff
import framebuf

from lib.mihuBLE import mihuBLE


# =====================================================
# TAMANHO DO ÍCONE
# =====================================================
BLE_W = 20
BLE_H = 15


# =====================================================
# ÍCONES BLE (20x15 | MONO_HLSB)
# =====================================================
BLE_ICON_OFF = bytes([
    0x00,0x00,0x00,0x00,0xc0,0x00,0x00,0xa0,0x00,0x08,
    0x90,0x00,0x04,0x08,0x00,0x02,0x10,0x00,0x01,0x80,
    0x00,0x00,0xc0,0x00,0x01,0xa0,0x00,0x02,0x90,0x00,
    0x04,0x88,0x00,0x08,0x90,0x00,0x00,0xa0,0x00,0x00,
    0xc0,0x00,0x00,0x00,0x00
])

BLE_ICON_ON = bytes([
    0x00,0x00,0x00,0x00,0xc0,0x00,0x00,0xa0,0x00,0x08,
    0x90,0x00,0x04,0x88,0x00,0x02,0x90,0x00,0x01,0xa0,
    0x00,0x00,0xc0,0x00,0x01,0xa0,0x00,0x02,0x90,0x00,
    0x04,0x88,0x00,0x08,0x93,0xc0,0x00,0xa3,0xc0,0x00,
    0xc3,0xc0,0x00,0x00,0x00
])


# =====================================================
# BLE WIDGET
# =====================================================
class BleWidget:
    def __init__(self, oled, x=0, y=0, blink_ms=400, check_ms=300):
        self.oled = oled
        self.x = x
        self.y = y

        self.blink_ms = blink_ms
        self.check_ms = check_ms

        # FrameBuffers criados UMA vez (🔥 chave do sucesso)
        self.fb_off = framebuf.FrameBuffer(
            bytearray(BLE_ICON_OFF), BLE_W, BLE_H, framebuf.MONO_HLSB
        )
        self.fb_on = framebuf.FrameBuffer(
            bytearray(BLE_ICON_ON), BLE_W, BLE_H, framebuf.MONO_HLSB
        )

        self.enabled = False
        self.connected = False
        self.visible = True

        now = ticks_ms()
        self.t_next_blink = ticks_add(now, blink_ms)
        self.t_next_check = ticks_add(now, 0)

        self.last_fb = None
        self.last_visible = None

    # -------------------------------------------------
    def set_enabled(self, on, name="MIHU_001"):
        on = bool(on)
        if on == self.enabled:
            return

        self.enabled = on

        if on:
            try:
                mihuBLE.start(name)
            except:
                pass
        else:
            try:
                mihuBLE.stop()
            except:
                pass

        self.last_fb = None
        self.last_visible = None

    # -------------------------------------------------
    def recv(self):
        if not self.enabled:
            return None
        try:
            return mihuBLE.recv()
        except:
            return None

    # -------------------------------------------------
    def _clear(self):
        self.oled.fill_rect(self.x, self.y, BLE_W, BLE_H, 0)

    def _apply(self, fb, visible):
        if fb is self.last_fb and visible == self.last_visible:
            return False

        self.last_fb = fb
        self.last_visible = visible

        self._clear()
        if visible:
            self.oled.draw_icon(fb, self.x, self.y)
        return True

    # -------------------------------------------------
    def update(self, now=None):
        if now is None:
            now = ticks_ms()

        dirty = False

        # BLE desligado
        if not self.enabled:
            return self._apply(self.fb_off, True)

        # checa conexão
        if ticks_diff(now, self.t_next_check) >= 0:
            self.t_next_check = ticks_add(now, self.check_ms)
            try:
                self.connected = mihuBLE.connected()
            except:
                self.connected = False

        # BLE conectado → ícone fixo ON
        if self.connected:
            self.visible = True
            return self._apply(self.fb_on, True)

        # BLE ligado mas não conectado → pisca OFF
        if ticks_diff(now, self.t_next_blink) >= 0:
            self.visible = not self.visible
            self.t_next_blink = ticks_add(now, self.blink_ms)
            dirty = True

        return dirty | self._apply(self.fb_off, self.visible)
