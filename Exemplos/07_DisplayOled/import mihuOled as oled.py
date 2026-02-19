from lib.mihuOled import mihuOled as oled
from time import sleep_ms

oled.init()
oled.clear()

oled.text_scale("MIHU", 20, 0, scale=3)
oled.text_scale("S3 V1.0", 14, 30, scale=2)
oled.text("Pronto!", 40, 56)

oled.show()
sleep_ms(2000)
