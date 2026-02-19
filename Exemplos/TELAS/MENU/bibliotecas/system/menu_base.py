# ui/menu_base.py
import framebuf
from time import ticks_ms, ticks_diff, sleep_ms
from lib.mihuButton.mihuButton import read_menu


class MenuBase:
    def __init__(self, oled, items):
        self.oled = oled
        self.items = items

        self.W = oled.oled().width
        self.H = oled.oled().height

        self.idx = 0
        self.frame_i = 0
        self.mode = "menu"

        self.FRAME_DELAY_MS = 42
        self.t_anim = ticks_ms()

    # -------------------------
    # Hooks (sobrescreva)
    # -------------------------
    def on_select(self, idx):
        """Chamado ao apertar OK"""
        pass

    def on_back(self):
        """Chamado ao apertar BACK"""
        pass

    # -------------------------
    # Render (obrigatórios)
    # -------------------------
    def render_menu(self, idx, frame_i=0, xoff=0):
        raise NotImplementedError

    def render_open(self, idx, xoff=0):
        raise NotImplementedError

    # -------------------------
    # Slides
    # -------------------------
    def slide_left(self, draw_old, draw_new):
        self.oled.shift_left(draw_old, draw_new, steps=16, delay_ms=12)

    def slide_right(self, draw_old, draw_new):
        if hasattr(self.oled, "shift_right"):
            self.oled.shift_right(draw_old, draw_new, steps=16, delay_ms=12)
        else:
            self.oled.shift_left(draw_new, draw_old, steps=16, delay_ms=12)

    # -------------------------
    # Loop principal
    # -------------------------
    def run(self):
        self.oled.clear()
        self.render_menu(self.idx, self.frame_i)
        self.oled.show()

        while True:
            key = read_menu()

            if self.mode == "menu" and key:
                if key in ("LEFT", "UP"):
                    old = self.idx
                    self.idx = (self.idx + 1) % len(self.items)
                    self.frame_i = 0

                    self.slide_left(
                        lambda x=0: self.render_menu(old, 0, x),
                        lambda x=0: self.render_menu(self.idx, 0, x)
                    )

                elif key in ("RIGHT", "DOWN"):
                    old = self.idx
                    self.idx = (self.idx - 1) % len(self.items)
                    self.frame_i = 0

                    self.slide_right(
                        lambda x=0: self.render_menu(old, 0, x),
                        lambda x=0: self.render_menu(self.idx, 0, x)
                    )

                elif key == "OK":
                    self.on_select(self.idx)

            elif self.mode == "open" and key == "BACK":
                self.on_back()

            # animação
            if self.mode == "menu":
                now = ticks_ms()
                if ticks_diff(now, self.t_anim) >= self.FRAME_DELAY_MS:
                    self.t_anim = now
                    self.frame_i += 1
                    self.oled.clear()
                    self.render_menu(self.idx, self.frame_i)
                    self.oled.show()

            sleep_ms(5)
