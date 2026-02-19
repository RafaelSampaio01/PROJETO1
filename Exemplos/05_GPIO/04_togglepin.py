from lib.mihuArduino.mihuGPIO import *

pinMode(9, OUTPUT)
pinMode(10, INPUT)

while True:
    
    if analogRead(10) > 3000: 
        toggle(9)
        delay(500)

