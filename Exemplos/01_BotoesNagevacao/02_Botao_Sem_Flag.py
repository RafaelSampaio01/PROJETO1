from lib.mihuButton import read_fast
from time import sleep_ms

print("Teste: read_fast (repeat enquanto segura)")

while True:
    btn = read_fast()
    if btn:
        print("FAST key:", btn)
        
        
    if btn == "UP":
        print("UP PRESSIONADO")
    sleep_ms(30)
