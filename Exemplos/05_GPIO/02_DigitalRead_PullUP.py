from lib.mihuGPIO import *

pinMode(17, INPUT_PULLUP)

while True:
    print(digitalRead(17))
    delay(500)
