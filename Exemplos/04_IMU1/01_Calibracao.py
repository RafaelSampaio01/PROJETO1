from lib import mihuIMU1

print("Calibrando... deixe parado")
print(mihuIMU1.calibrate(samples=300, delay_ms=5))



