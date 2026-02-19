# =========================================================
# MIHU BOOT — API EDUCACIONAL GLOBAL
# =========================================================

import builtins

# -------------------------
# Hardware (portas P1..M4)
# -------------------------
from mihu_hw import *
builtins.P1 = P1
builtins.P2 = P2
builtins.P3 = P3
builtins.M1 = M1
builtins.M2 = M2
builtins.M3 = M3
builtins.M4 = M4

# -------------------------
# Sensor de Cor (API limpa)
# -------------------------
from cor_sensor import *

builtins.getColor = getColor
builtins.ev3_color_name = ev3_color_name

builtins.COR       = COR
builtins.R         = R
builtins.G         = G
builtins.B         = B
builtins.REFLEXAO  = REFLEXAO
builtins.AMBIENTE  = AMBIENTE

# -------------------------
# Utilidades básicas
# -------------------------
from time import sleep
builtins.sleep = sleep

# =========================================================
# FIM DO BOOT
# =========================================================
