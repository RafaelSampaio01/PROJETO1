from lib.mihuOled import mihuOled as oled
from time import sleep_ms

oled.init()

n = 0
while True:
    oled.clear()

    #oled.text("Contador:", 0, 0)
    oled.text_scale(str(n), 20, 10, scale=6)

    oled.show()

    n += 1
    sleep_ms(200)
