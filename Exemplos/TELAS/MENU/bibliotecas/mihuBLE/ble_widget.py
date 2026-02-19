# system/ble_widget.py
import framebuf
from time import ticks_ms, ticks_add, ticks_diff
from lib.mihuBLE import mihuBLE as ble

# =====================================================
# ICONES BLE (16x16 | MONO_HLSB)
# =====================================================

BLE_OFF = bytes([
    0x00,0x00,0x00,0x00,0xc0,0x00,0x00,0xa0,0x00,0x08,0x90,0x00,0x04,0x08,0x00,0x02,
    0x10,0x00,0x01,0x80,0x00,0x00,0xc0,0x00,0x01,0xa0,0x00,0x02,0x90,0x00,0x04,0x88,
    0x00,0x08,0x90,0x00,0x00,0xa0,0x00,0x00,0xc0,0x00,0x00,0x00,0x00
])

BLE_CONECT = bytes([
    0x00,0x00,0x00,0x00,0xc0,0x00,0x00,0xa0,0x00,0x08,0x90,0x00,0x04,0x88,0x00,0x02,
    0x90,0x00,0x01,0xa0,0x00,0x00,0xc0,0x00,0x01,0xa0,0x00,0x02,0x90,0x00,0x04,0x88,
    0x00,0x08,0x90,0x00,0x00,0xa0,0x00,0x00,0xc0,0x00,0x00,0x00,0x00
])

BLE_OK = bytes([
    0x00,0x00,0x00,0x00,0xc0,0x00,0x00,0xa0,0x00,0x08,0x90,0x00,0x04,0x88,0x00,0x02,
    0x90,0x00,0x01,0xa0,0x00,0x00,0xc0,0x00,0x01,0xa0,0x00,0x02,0x90,0x00,0x04,0x88,
    0x00,0x08,0x93,0xc0,0x00,0xa3,0xc0,0x00,0xc3,0xc0,0x00,0x00,0x00
])

# =====================================================
# CONTROLE BLE (CORE) – MESMO PADRÃO DO WIFI
# =====================================================

_ble_enabled = False
_ble_name = "MIHU-001"


def ble_enable(enable, name=None):
    """
    Liga ou desliga o BLE.
    enable: True / False
    name: nome opcional ao ligar
    """
    global _ble_enabled, _ble_name

    enable = bool(enable)

    if enable:
        if name:
            _ble_name = str(name)

        if not _ble_enabled:
            ble.start(_ble_name)
            _ble_enabled = True
    else:
        if _ble_enabled:
            ble.stop()
            _ble_enabled = False


def ble_is_enabled():
    return _ble_enabled


def ble_is_connected():
    try:
        return ble.connected()
    except:
        return False


# =====================================================
# BLE WIDGET (APENAS VISUAL)
# =====================================================

class BleWidget:
    def __init__(self, oled, x=0, y=0, w=16, h=16,
                 blink_ms=300, check_ms=300):

        self.oled = oled
        self.x, self.y, self.w, self.h = x, y, w, h

        self.blink_ms = blink_ms
        self.check_ms = check_ms

        self.visible = True
        self.connected = False

        now = ticks_ms()
        self.t_next_blink = ticks_add(now, self.blink_ms)
        self.t_next_check = ticks_add(now, 0)

        self.last_fb = None
        self.last_visible = None

        # framebuffers dos ícones
        self.fb_off = framebuf.FrameBuffer(
            bytearray(BLE_OFF), 20, 15, framebuf.MONO_HLSB
        )
        self.fb_conect = framebuf.FrameBuffer(
            bytearray(BLE_CONECT), 20, 15, framebuf.MONO_HLSB
        )
        self.fb_ok = framebuf.FrameBuffer(
            bytearray(BLE_OK), 20, 15, framebuf.MONO_HLSB
        )

    # ---------------- desenho ----------------
    def _apply(self, fb, visible):
        if fb is self.last_fb and visible == self.last_visible:
            return False

        self.last_fb = fb
        self.last_visible = visible

        self.oled.fill_rect(self.x, self.y, self.w, self.h, 0)
        if visible:
            self.oled.draw_icon(fb, self.x, self.y)
        return True

    # ---------------- update ----------------
    def update(self, now=None):
        if now is None:
            now = ticks_ms()

        dirty = False

        # BLE desligado
        if not ble_is_enabled():
            return dirty | self._apply(self.fb_off, True)

        # checa conexão
        if ticks_diff(now, self.t_next_check) >= 0:
            self.t_next_check = ticks_add(now, self.check_ms)
            self.connected = ble_is_connected()

        # BLE conectado
        if self.connected:
            self.visible = True
            return dirty | self._apply(self.fb_ok, True)

        # BLE ativo (advertising) → pisca
        if ticks_diff(now, self.t_next_blink) >= 0:
            self.visible = not self.visible
            self.t_next_blink = ticks_add(now, self.blink_ms)
            dirty = True

        return dirty | self._apply(self.fb_conect, self.visible)
