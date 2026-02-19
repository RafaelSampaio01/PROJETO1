from lib.mihuMotor.mihuServo import setServoAngle, servoOff
from time import sleep_ms

servoOff("S1")         #deliga o PWM do Servo s1
servoOff("S2")         #deliga o PWM do Servo s2
servoOff("S3")         #deliga o PWM do Servo s3
servoOff("S4")         #deliga o PWM do Servo s4
servoOff("S5")         #deliga o PWM do Servo s5
servoOff("S6")         #deliga o PWM do Servo s6
servoOff("S7")         #deliga o PWM do Servo s7
servoOff("S8")         #deliga o PWM do Servo s8


for x in range(8):     #Aceita Numero de 0-7
    servoOff(x)
    print(x)

   
   
for x in range(8):     #Aceita Numero de 0-7
    setServoAngle(x,0)
    sleep_ms(100)
    print(x)


#individual
setServoAngle("S1", 180)
sleep_ms(100)
setServoAngle("S2", 0)
sleep_ms(100)
setServoAngle("S2", 0)
sleep_ms(100)
setServoAngle("S3", 0)
sleep_ms(100)
setServoAngle("S4", 0)
sleep_ms(100)
setServoAngle("S8", 0)
sleep_ms(100)
setServoAngle("S6", 0)
sleep_ms(100)
setServoAngle("S7", 0)
sleep_ms(100)
setServoAngle("S8", 0)
sleep_ms(100)
c