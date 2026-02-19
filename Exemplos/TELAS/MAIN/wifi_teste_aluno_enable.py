from lib.mihuOled import mihuOled as oled
from system.wifi_widget import WifiWidget
from time import ticks_ms
import machine

def draw_status_text(msg):
    oled.fill_rect(0, 52, 128, 12, 0)
    oled.text(msg, 0, 55)
    return True

oled.init()
oled.clear()

wifi_ui = WifiWidget(oled, x=0, y=0, status_cb=draw_status_text, off_draw_x=True)
wifi_ui.set_credentials("moto g05", "1234567890")
wifi_ui.set_enabled(True)   # ou False

while True:
    now = ticks_ms()
    dirty = False

    # ... seu menu ...

    dirty |= wifi_ui.update(now)

    if dirty:
        oled.show()

    machine.idle()
