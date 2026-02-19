from lib.mihuArduino.mihuGPIO import *

pinMode(10, INPUT)

while True:
    print(analogRead(10))
    delay(500)
