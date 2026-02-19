import framebuf
from time import ticks_ms, ticks_diff

from lib.mihuADS.ads1x15 import ADS1115


class BattWidgetADS:
    def __init__(
        self,
        oled,
        i2c,
        adc_addr=0x49,
        channel=0,
        x=96,
        y=0,
        w=24,
        h=12,
        v_min=6.4,
        v_max=8.4,
        divider_factor=2.5,
        update_ms=800,
        toggle_ms=2000   # ⏱ alterna ícone ↔ %
    ):
        self.oled = oled
        self.x = x
        self.y = y
        self.w = w
        self.h = h

        self.v_min = v_min
        self.v_max = v_max
        self.divider = divider_factor

        self.update_ms = update_ms
        self.toggle_ms = toggle_ms

        self.last_update = 0
        self.last_toggle = 0
        self.show_percent = False

        self.last_level = -1
        self.last_percent = -1

        self.adc = ADS1115(i2c, address=adc_addr)
        self.channel = channel

        # Ícones
        self.icon_empty = self._make_icon(0)
        self.icon_levels = [
            self._make_icon(1),
            self._make_icon(2),
            self._make_icon(3),
            self._make_icon(4),
        ]

    # -------------------------------------------------
    def _make_icon(self, level):
        buf = bytearray((self.w * self.h) // 8)
        fb = framebuf.FrameBuffer(buf, self.w, self.h, framebuf.MONO_HLSB)

        # contorno
        fb.rect(0, 0, self.w - 3, self.h, 1)
        fb.fill_rect(self.w - 3, self.h // 3, 3, self.h // 3, 1)

        if level > 0:
            inner_w = self.w - 6
            bar_w = inner_w // 4

            for i in range(level):
                fb.fill_rect(
                    2 + i * bar_w,
                    2,
                    bar_w - 1,
                    self.h - 4,
                    1
                )
        return fb

    # -------------------------------------------------
    def _read_voltage(self):
        raw = self.adc.read(self.channel)
        v = raw * 4.096 / 32768
        return v * self.divider

    # -------------------------------------------------
    def _voltage_to_percent(self, v):
        if v <= self.v_min:
            return 0
        if v >= self.v_max:
            return 100
        return int((v - self.v_min) * 100 / (self.v_max - self.v_min))

    # -------------------------------------------------
    def _percent_to_level(self, pct):
        if pct <= 5:
            return 0
        if pct >= 95:
            return 4
        return max(1, min(4, pct // 25 + 1))

    # -------------------------------------------------
    def update(self, now=None):
        if now is None:
            now = ticks_ms()

        dirty = False

        # alterna ícone ↔ %
        if ticks_diff(now, self.last_toggle) >= self.toggle_ms:
            self.last_toggle = now
            self.show_percent = not self.show_percent
            dirty = True

        if ticks_diff(now, self.last_update) < self.update_ms and not dirty:
            return False

        self.last_update = now

        try:
            v = self._read_voltage()
            pct = self._voltage_to_percent(v)
            level = self._percent_to_level(pct)
        except:
            pct = 0
            level = 0

        if pct == self.last_percent and level == self.last_level and not dirty:
            return False

        self.last_percent = pct
        self.last_level = level

        # limpa área
        self.oled.fill_rect(self.x, self.y, self.w + 12, self.h, 0)

        if self.show_percent:
            txt = "%d%%" % pct
            self.oled.text(txt, self.x, self.y + 2)
        else:
            if level == 0:
                self.oled.draw_icon(self.icon_empty, self.x, self.y)
            else:
                self.oled.draw_icon(self.icon_levels[level - 1], self.x, self.y)

        return True
