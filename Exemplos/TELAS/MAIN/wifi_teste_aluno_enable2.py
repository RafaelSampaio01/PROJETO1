from lib.mihuOled import mihuOled as oled
from system.wifi_widget import WifiWidget
from time import ticks_ms
import machine

oled.init()
oled.clear()

wifi_ui = WifiWidget(oled, x=0, y=0)
wifi_ui.set_credentials("moto g05", "1234567890")
wifi_ui.set_enabled(False)  #Liga a Rede Wifi

while True:
    now = ticks_ms()
    dirty = False

  

    dirty |= wifi_ui.update(now)

    if dirty:
        oled.show()

    machine.idle()
