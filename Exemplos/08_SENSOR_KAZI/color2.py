from lib.mihuMotor.mihuMotor import *

from time import sleep
while True:
    
    codigo = getColor(P2, COR)
    
    
    print("Cor EV3:", codigo, "-", ev3_color_name(codigo))

    print("R:", getColor(P2, R))
    print("G:", getColor(P2, G))
    print("B:", getColor(P2, B))
    print("Reflexão:", getColor(P2, REFLEXAO))
    print("Ambiente:", getColor(P2, AMBIENTE))
    
    if getColor(P2, AMBIENTE) >= 50:
        setMotorPin(M1,100)
        print("ligado")
    else:
        setMotorPin(M1,0)
        print("desligado")
    delay(100)
