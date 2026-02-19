from lib import mihuIMU1
from time import sleep_ms

print("Calibrando... deixe parado")
mihuIMU1.calibrate()

while True:
    gx = mihuIMU1.getGxCal()
    gy = mihuIMU1.getGyCal()
    gz = mihuIMU1.getGzCal()
    print(gx, gy, gz, sep=",")
    sleep_ms(50)
