from time import sleep_ms
from lib.mihuBLE.DABBLE import DabbleGamePad

pad = DabbleGamePad("MIHU-001")

while True:
    if pad.update():

        if pad.is_idle_event():
            print("IDLE (tudo solto)")

        if pad.mode == 0:
            if pad.is_up():    print("UP")
            if pad.is_down():  print("DOWN")
            if pad.is_left():  print("LEFT")
            if pad.is_right(): print("RIGHT")

        elif pad.mode == 1:
            print("JOY:", round(pad.get_x(), 2), round(pad.get_y(), 2))

        elif pad.mode == 2:
            print("ACCEL:", round(pad.accel_value(), 2))

        if pad.is_cross():    print("X")
        if pad.is_circle():   print("O")
        if pad.is_triangle(): print("TRIANGLE")
        if pad.is_square():   print("SQUARE")
        if pad.is_start():    print("START")
        if pad.is_select():   print("SELECT")


    sleep_ms(10)
