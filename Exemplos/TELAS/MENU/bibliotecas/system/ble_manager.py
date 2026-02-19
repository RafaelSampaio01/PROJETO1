# system/ble_widget.py
import framebuf
from time import ticks_ms, ticks_add, ticks_diff
from lib.mihuBLE import mihuBLE as ble


BLE_W = 20
BLE_H = 15


# ICONES (EXATAMENTE OS DO TESTE)
BLE_OFF = bytes([...])        # seus bytes originais
BLE_ON = bytes([...])
BLE_CONNECTED = bytes([...])

_ble_enabled = False
_ble_name = "MIHU-001"


def ble_enable(enable, name=None):
    global _ble_enabled, _ble_name
    enable = bool(enable)

    if enable:
        if name:
            _ble_name = name
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


class BleWidget:
    def __init__(self, oled, x=0, y=0, blink_ms=300, check_ms=300):
        self.oled = oled
        self.x, self.y = x, y
        self.w, self.h = BLE_W, BLE_H

        self.blink_ms = blink_ms
        self.check_ms = check_ms

        self.visible = True
        self.connected = False

        now = ticks_ms()
        self.t_next_blink = ticks_add(now, blink_ms)
        self.t_next_check = ticks_add(now, 0)

        self.last_fb = None
        self.last_visible = None

        # ⚠️ FRAMEBUFFERS FIXOS (IGUAL AO TESTE)
        self.fb_off = framebuf.FrameBuffer(BLE_OFF, 20, 15, framebuf.MONO_HLSB)
        self.fb_on  = framebuf.FrameBuffer(BLE_ON,  20, 15, framebuf.MONO_HLSB)
        self.fb_ok  = framebuf.FrameBuffer(BLE_CONNECTED, 20, 15, framebuf.MONO_HLSB)

    def _clear(self):
        self.oled.fill_rect(self.x, self.y, self.w, self.h, 0)

    def _apply(self, fb, visible):
        if fb is self.last_fb and visible == self.last_visible:
            return False

        self.last_fb = fb
        self.last_visible = visible

        self._clear()
        if visible:
            self.oled.draw_icon(fb, self.x, self.y)
        return True

    def update(self, now=None):
        if now is None:
            now = ticks_ms()

        if not ble_is_enabled():
            self.visible = True
            return self._apply(self.fb_off, True)

        if ticks_diff(now, self.t_next_check) >= 0:
            self.t_next_check = ticks_add(now, self.check_ms)
            self.connected = ble_is_connected()

        if self.connected:
            self.visible = True
            return self._apply(self.fb_ok, True)

        if ticks_diff(now, self.t_next_blink) >= 0:
            self.visible = not self.visible
            self.t_next_blink = ticks_add(now, self.blink_ms)

        return self._apply(self.fb_on, self.visible)
