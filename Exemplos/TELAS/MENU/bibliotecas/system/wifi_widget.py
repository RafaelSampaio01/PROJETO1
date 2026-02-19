# system/wifi_widget.py
import framebuf
from time import ticks_ms, ticks_add, ticks_diff, sleep_ms


class WifiWidget:
    MODE_OFF        = 0
    MODE_CONNECTING = 1
    MODE_LOW        = 2
    MODE_MEDIO      = 3
    MODE_ALTO       = 4

    def __init__(self, oled, x=0, y=0, w=20, h=15,
                 anim_ms=160, blink_ms=180,
                 wifi_check_ms=500, connect_retry_ms=3000,
                 status_cb=None,
                 off_draw_x=True):

        self.oled = oled
        self.x, self.y, self.w, self.h = x, y, w, h

        self.anim_ms = anim_ms
        self.blink_ms = blink_ms
        self.wifi_check_ms = wifi_check_ms
        self.connect_retry_ms = connect_retry_ms

        self.status_cb = status_cb
        self.off_draw_x = off_draw_x

        # --------------------------------------------------
        # ICONES (inalterados)
        # --------------------------------------------------
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

        # 🔑 NÃO inicializa Wi-Fi aqui
        self.wlan = None
        self.enabled = False
        self.mode = self.MODE_OFF

        self.ssid = None
        self.password = None

    # ---------------- API ----------------
    def set_credentials(self, ssid, password):
        self.ssid = ssid
        self.password = password

    def set_enabled(self, on):
        on = bool(on)
        if on == self.enabled:
            return

        self.enabled = on
        now = ticks_ms()
        self.t_next_wifi_check = ticks_add(now, 0)
        self.t_next_connect_try = ticks_add(now, 0)

        import network

        if on:
            try:
                # reset seguro do rádio
                try:
                    network.WLAN(network.STA_IF).active(False)
                    sleep_ms(120)
                except:
                    pass

                self.wlan = network.WLAN(network.STA_IF)
                self.wlan.active(True)
                self.mode = self.MODE_CONNECTING
                self._set_status("WIFI ON")

            except Exception as e:
                print("⚠️ WiFi init falhou:", e)
                self.wlan = None
                self.enabled = False
                self.mode = self.MODE_OFF

        else:
            try:
                if self.wlan:
                    self.wlan.disconnect()
                    self.wlan.active(False)
            except:
                pass

            self.wlan = None
            self.mode = self.MODE_OFF
            self._set_status("WIFI OFF")

        self.last_fb = None
        self.last_visible = None

    # ---------------- update ----------------
    def update(self, now=None):
        if now is None:
            now = ticks_ms()

        dirty = False

        if not self.enabled or not self.wlan:
            dirty |= self._apply(self.fb_off, True)
            if self.off_draw_x:
                self._draw_x_overlay_pixel()
            return dirty

        if ticks_diff(now, self.t_next_wifi_check) >= 0:
            self.t_next_wifi_check = ticks_add(now, self.wifi_check_ms)

            try:
                if self.wlan.isconnected():
                    rssi = self.wlan.status("rssi")
                    if rssi >= -60:
                        self.mode = self.MODE_ALTO
                    elif rssi >= -75:
                        self.mode = self.MODE_MEDIO
                    else:
                        self.mode = self.MODE_LOW
                    dirty |= self._set_status("CONECTADO")
                else:
                    self.mode = self.MODE_CONNECTING
                    dirty |= self._set_status("SEM WIFI")
            except:
                self.mode = self.MODE_CONNECTING

        if self.mode == self.MODE_CONNECTING and ticks_diff(now, self.t_next_connect_try) >= 0:
            self.t_next_connect_try = ticks_add(now, self.connect_retry_ms)
            if self.ssid and self.password:
                try:
                    self.wlan.disconnect()
                    sleep_ms(150)
                    self.wlan.connect(self.ssid, self.password)
                except:
                    pass

        fb = {
            self.MODE_LOW:   self.fb_low,
            self.MODE_MEDIO: self.fb_medio,
            self.MODE_ALTO:  self.fb_alto,
        }.get(self.mode, self.frames[self.frame_i])

        if self.mode == self.MODE_CONNECTING:
            if ticks_diff(now, self.t_next_frame) >= 0:
                self.frame_i = (self.frame_i + 1) % len(self.frames)
                self.t_next_frame = ticks_add(now, self.anim_ms)
            if ticks_diff(now, self.t_next_blink) >= 0:
                self.visible = not self.visible
                self.t_next_blink = ticks_add(now, self.blink_ms)
            return dirty | self._apply(fb, self.visible)

        return dirty | self._apply(fb, True)

    # ---------------- desenho ----------------
    def _clear_area(self):
        self.oled.fill_rect(self.x, self.y, self.w, self.h, 0)

    def _draw_x_overlay_pixel(self):
        for i in range(min(self.w, self.h)):
            self.oled.pixel(self.x + i, self.y + i, 1)
            self.oled.pixel(self.x + self.w - 1 - i, self.y + i, 1)

    def _apply(self, fb, visible):
        if fb is self.last_fb and visible == self.last_visible:
            return False
        self.last_fb = fb
        self.last_visible = visible
        self._clear_area()
        if visible:
            self.oled.draw_icon(fb, self.x, self.y)
        return True

    def _set_status(self, msg):
        if msg == self.last_status:
            return False
        self.last_status = msg
        if self.status_cb:
            try:
                return bool(self.status_cb(msg))
            except:
                return False
        return False
