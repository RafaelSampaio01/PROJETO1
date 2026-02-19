import cor_sensor as cor
import time

while True:
    t0 = time.ticks_us()  # início (microssegundos)

    gray = cor.getCorF2(cor.M4, cor.COR_EV3)

    t1 = time.ticks_us()  # fim

    dt_us = time.ticks_diff(t1, t0)
    dt_ms = dt_us / 1000

    print(gray) #"| Tempo =", dt_ms, "ms"

    #time.sleep(0.2)
