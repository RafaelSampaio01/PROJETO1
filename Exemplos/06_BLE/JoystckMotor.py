from time import sleep_ms
from lib.mihuBLE.DABBLE import DabbleGamePad
from lib.mihuMotor.mihuMotor import setMotorPin

# ======================================
# CONFIGURAÇÃO
# ======================================

MOTOR_ESQUERDO = 0   # M1
MOTOR_DIREITO  = 1   # M2

# ======================================
# CONTROLE
# ======================================

pad = DabbleGamePad("MIHU-001")

print("🎮 Controle do robô iniciado")

# ======================================
# LOOP PRINCIPAL
# ======================================

while True:
    if pad.any() and pad.update():

        # 👇 UMA LINHA CONTROLA O ROBÔ TODO
        pad.drive(MOTOR_ESQUERDO, MOTOR_DIREITO, setMotorPin)

    sleep_ms(30)
