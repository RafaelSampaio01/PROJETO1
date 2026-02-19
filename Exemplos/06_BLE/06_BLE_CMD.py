from time import sleep_ms
from lib.mihuBLE import mihuBLE
#from lib.mihuMotor import setMotorPin
#from lib.mihuServo import setServoAngle, servoOff

mihuBLE.start("MIHU_001")

while True:
    cmd = mihuBLE.recv()      # pega 1 comando por vez (ou None)
    if cmd:
        cmd = cmd.strip().lower()

        if cmd == "on":
            print("LIGADO")
        #    mihuBLE.send("ACK ON")
        #    setMotorPin("M1", 100)
        #    setServoAngle("S1", 180)
        elif cmd == "off":
            print("DESLIGADO")
        #    mihuBLE.send("ACK OFF")
        #    setMotorPin("M1", 0)
        #    setServoAngle("S1", 0)
        else:
            print("COMANDO INVALIDO:", cmd)
            mihuBLE.send("ERR comando")

    sleep_ms(10)
