from bib.mihuOled import mihuOled as oled
from time import sleep_ms

oled.init()
oled.clear()

oled.text("OLA MUNDO 23", 20, 0)
oled.rect(0, 12, 128, 52, 1)
oled.line(0, 12, 127, 63, 1)

oled.show()
sleep_ms(2000)
