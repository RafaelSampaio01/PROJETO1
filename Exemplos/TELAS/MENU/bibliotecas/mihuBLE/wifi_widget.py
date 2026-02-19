# system/wifi_widget.py
import framebuf
import network
from time import ticks_ms, ticks_add, ticks_diff


class WifiWidget:
    def __init__(self, oled, x=0, y=0, w=20, h=15,
                 anim_ms=160, blink_ms=180,
                 wifi_check_ms=300, connect_retry_ms=5000,
                 status_cb=None,
                 off_draw_x=False):

        self.oled = oled
        self.x, self.y, self.w, self.h = x, y, w, h

        self.anim_ms = anim_ms
        self.blink_ms = blink_ms
        self.wifi_check_ms = wifi_check_ms
        self.connect_retry_ms = connect_retry_ms

        self.status_cb = status_cb
        self.off_draw_x = off_draw_x

        # -------------------------------
        # ICONES WIFI (20x15 MONO_HLSB)
        # -------------------------------
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

        wifi_off = bytes([
            0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x02,0x00,0x00,0x04,0x00,0x00,0x08,0x00,0x07,
            0x93,0x00,0x08,0x20,0x80,0x12,0x4e,0x40,0x24,0x81,0x20,0x49,0x3c,0x90,0x12,0x02,
            0x40,0x04,0x71,0x00,0x08,0x70,0x00,0x10,0x70,0x00,0x00,0x00,0x00
        ])

        self.fb_low   = framebuf.FrameBuffer(bytearray(wifi_low),   20, 15, framebuf.MONO_HLSB)
        self.fb_medio = framebuf.FrameBuffer(bytearray(wifi_medio), 20, 15, framebuf.MONO_HLSB)
        self.fb_alto  = framebuf.FrameBuffer(bytearray(wifi_alto),  20, 15, framebuf.MONO_HLSB)
        self.fb_off   = framebuf.FrameBuffer(bytearray(wifi_off),   20, 15, framebuf.MONO_HLSB)

        self.frames = [self.fb_low, self.fb_medio, self.fb_alto, self.fb_medio]
        self.frame_i = 0
        self.visible = True

        now = ticks_ms()
        self.t_next_frame = ticks_add(now, self.anim_ms)
        self.t_next_blink = ticks_add(now, self.blink_ms)
        self.t_next_wifi_check = ticks_add(now, 0)
        self.t_next_connect_try = ticks_add(now, 0)

        self.last_fb = None
        self.last_visible = None
        self.last_status = None

        # -------------------------------
        # WIFI / IP
        # -------------------------------
        self.wlan = network.WLAN(network.STA_IF)
        self.enabled = False
        self.mode = 0
        self.ssid = None
        self.password = None
        self.ip = None

    # ---------------- API ----------------
    def set_credentials(self, ssid, password):
        self.ssid = ssid
        self.password = password

    def set_enabled(self, on):
        on = bool(on)
        if on == self.enabled:
            return

        self.enabled = on
        self.ip = None

        now = ticks_ms()
        self.t_next_wifi_check = ticks_add(now, 0)
        self.t_next_connect_try = ticks_add(now, 0)

        if self.enabled:
            try:
                self.wlan.active(True)
            except:
                pass
            self._set_status("WIFI ON")
        else:
            try:
                self.wlan.disconnect()
            except:
                pass
            try:
                self.wlan.active(False)
            except:
                pass
            self._set_status("WIFI OFF")

        self.last_fb = None
        self.last_visible = None

    def toggle(self):
        self.set_enabled(not self.enabled)

    def get_ip(self):
        return self.ip

    def is_connected(self):
        try:
            return self.wlan.isconnected()
        except:
            return False

    # -------------- desenho --------------
    def _clear_area(self):
        self.oled.fill_rect(self.x, self.y, self.w, self.h, 0)

    def _draw_wifi(self, fb):
        self._clear_area()
        self.oled.draw_icon(fb, self.x, self.y)

    def _apply(self, fb, visible):
        if fb is self.last_fb and visible == self.last_visible:
            return False

        self.last_fb = fb
        self.last_visible = visible

        if not visible:
            self._clear_area()
        else:
            self._draw_wifi(fb)
        return True

    def _set_status(self, msg):
        if msg == self.last_status:
            return False

        self.last_status = msg
        if self.status_cb:
            try:
                return bool(self.status_cb(msg))
            except:
                pass
        return False

    # -------------- RSSI --------------
    def _get_rssi_safe(self):
        try:
            return self.wlan.status("rssi")
        except:
            return None

    def _rssi_to_mode(self, rssi):
        if rssi is None:
            return 1
        if rssi >= -60:
            return 3
        if rssi >= -75:
            return 2
        return 1

    # -------------- update --------------
    def update(self, now=None):
        if now is None:
            now = ticks_ms()

        dirty = False

        # WIFI OFF
        if not self.enabled:
            return dirty | self._apply(self.fb_off, True)

        # checa estado
        if ticks_diff(now, self.t_next_wifi_check) >= 0:
            self.t_next_wifi_check = ticks_add(now, self.wifi_check_ms)

            if not self.is_connected():
                self.mode = 0
                self.ip = None
                dirty |= self._set_status("SEM WIFI")
            else:
                rssi = self._get_rssi_safe()
                self.mode = self._rssi_to_mode(rssi)
                try:
                    self.ip = self.wlan.ifconfig()[0]
                except:
                    self.ip = None
                dirty |= self._set_status("CONECTADO")

        # tenta reconectar
        if self.mode == 0 and ticks_diff(now, self.t_next_connect_try) >= 0:
            self.t_next_connect_try = ticks_add(now, self.connect_retry_ms)
            if self.ssid and self.password:
                try:
                    self.wlan.active(True)
                    self.wlan.connect(self.ssid, self.password)
                except:
                    pass

        if self.mode == 1:
            return dirty | self._apply(self.fb_low, True)
        if self.mode == 2:
            return dirty | self._apply(self.fb_medio, True)
        if self.mode == 3:
            return dirty | self._apply(self.fb_alto, True)

        # anima
        changed = False
        if ticks_diff(now, self.t_next_frame) >= 0:
            self.frame_i = (self.frame_i + 1) % len(self.frames)
            self.t_next_frame = ticks_add(now, self.anim_ms)
            changed = True

        if ticks_diff(now, self.t_next_blink) >= 0:
            self.visible = not self.visible
            self.t_next_blink = ticks_add(now, self.blink_ms)
            changed = True

        if not changed:
            return dirty

        return dirty | self._apply(self.frames[self.frame_i], self.visible)
