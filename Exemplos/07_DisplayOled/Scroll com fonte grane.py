from lib.mihuOled import mihuOled as oled

oled.init()



# Scroll infinito (CTRL+C pra parar no REPL)
oled.scroll_text_scale("MIHU OS - MENU MAKER  ", y=25, scale=3, speed=5, delay_ms=25)
