from lib.mihuIMU import mihuIMU
from time import sleep_ms

print("Calibrando... deixe parado")
mihuIMU1.calibrate()

while True:
    pitch = mihuIMU1.getSensorAngle("X")  # X -> pitch
    roll  = mihuIMU1.getSensorAngle("Y")  # Y -> roll

    print(pitch,roll, sep=",")
    sleep_ms(100)
