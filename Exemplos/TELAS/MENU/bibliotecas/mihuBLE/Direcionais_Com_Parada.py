from time import sleep_ms
from lib.mihuBLE.DABBLE import DabbleGamePad

pad = DabbleGamePad("MIHU-001")

print("🎮 Controle do Robô Iniciado")

while True:
    if pad.any():
        if pad.update():

            if pad.is_up():
                print("🚗 FRENTE")

            elif pad.is_down():
                print("🔙 TRÁS")

            elif pad.is_left():
                print("⬅️ ESQUERDA")

            elif pad.is_right():
                print("➡️ DIREITA")
                
            elif pad.is_cross():
                print("X")

            else:
                print("⏹ PARAR")

    sleep_ms(100)
