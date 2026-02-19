from lib.mihuButton.mihuButton import read_menu
from time import sleep_ms

print("Teste: read_menu (evento único por pressão)")

while True:
    btn = read_menu()
    if btn:
        print("MENU key:", btn)

        if btn == "UP":
            print("BTN CIMA")
        elif btn == "DOWN":
            print("BTN BAIXO")
        elif btn == "LEFT":
            print("BTN ESQUERDA")
        elif btn == "RIGHT":
            print("BTN DIREITA")
        elif btn == "OK":
            print("BTN OK")
        elif btn == "BACK":
            print("BTN VOLTAR")

    sleep_ms(30)
