import ultra as dis
from time import sleep

while True:
    d = dis.get(dis.P1, dis.CM)
    print("Distância:", d, "cm")
    sleep(0.3)
