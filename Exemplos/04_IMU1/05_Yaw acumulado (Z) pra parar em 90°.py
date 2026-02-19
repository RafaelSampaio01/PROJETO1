from lib import mihuIMU1
from time import sleep_ms

mihuIMU1.calibrate()
mihuIMU1.reset_gyro_angles()

target = 90

while True:
    yaw = mihuIMU1.getSensorAngle("Z")  # graus acumulados (Z invertido na sua lib)
    print("Yaw:", yaw)

    if yaw >= target:
        print("Chegou em 90°")
        break

    sleep_ms(10)
