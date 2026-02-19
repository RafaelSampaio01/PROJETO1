from mihu_hw import*
import cor_sensor as cor
from time import sleep


while True:
    ev3 = cor.getCorF2(M4, cor.COR_EV3)

    r = cor.getCorF2(M4, cor.COR_RGB_R)
    g = cor.getCorF2(M4, cor.COR_RGB_G)
    b = cor.getCorF2(M4, cor.COR_RGB_B)

    gray = cor.getCorF2(M4, cor.COR_GRAY)
    ambient = cor.getCorF2(M4, cor.COR_LUZ_AMBIENTE)

    print(
        "COR:", cor.ev3_color_name(ev3),
        "| COD=", ev3,
        "| RGB=(", r, g, b, ")",
        "| GRAY=", gray,
        "| AMBIENT=", ambient
    )

    sleep(0.1)
