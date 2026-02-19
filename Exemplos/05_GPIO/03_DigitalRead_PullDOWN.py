from lib.mihuGPIO import *

pinMode(17, INPUT_PULLDOWN)

while True:
    print(digitalRead(17))
    delay(500)
