from lib import mihuIMU1
from time import sleep_ms

print("Calibrando... deixe parado")
mihuIMU1.calibrate()

while True:
    ax = mihuIMU1.getAxRaw()
    ay = mihuIMU1.getAyRaw()
    az = mihuIMU1.getAzRaw() 
    
    # Imprime os valores separados por vírgula
    print(ax, ay, az, sep=",")
    
    sleep_ms(100)
