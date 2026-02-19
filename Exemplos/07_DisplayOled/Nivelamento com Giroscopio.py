from lib.mihuIMU import mihuIMU1
from lib.mihuOled import mihuOled as oled
from lib.mihuArduino.mihuGPIO import *
from lib.mihuButton.mihuButton import read_fast

from time import ticks_ms, ticks_diff, sleep_ms
import math

LED = 9

pinMode(LED, OUTPUT)
digitalWrite(LED,0x01)

# =========================
# MAPA DE EIXOS (AJUSTE AQUI)
# Se o chip foi montado invertido e:
#   pitch que era X agora está em Y, e roll que era Y agora está em X:
# =========================
PITCH_AXIS = "Y"   # era "X"
ROLL_AXIS  = "X"   # era "Y"

# Se algum eixo estiver “ao contrário”, mude para -1
PITCH_SIGN = -1
ROLL_SIGN  = +1

def draw_circle(cx, cy, r, color=1):
    x = r
    y = 0
    d = 1 - r
    while x >= y:
        oled.pixel(cx + x, cy + y, color)
        oled.pixel(cx + y, cy + x, color)
        oled.pixel(cx - y, cy + x, color)
        oled.pixel(cx - x, cy + y, color)
        oled.pixel(cx - x, cy - y, color)
        oled.pixel(cx - y, cy - x, color)
        oled.pixel(cx + y, cy - x, color)
        oled.pixel(cx + x, cy - y, color)
        y += 1
        if d < 0:
            d += 2 * y + 1
        else:
            x -= 1
            d += 2 * (y - x) + 1

def fill_circle(cx, cy, r, color=1):
    for yy in range(-r, r + 1):
        xx = int(math.sqrt(r * r - yy * yy))
        for xx2 in range(-xx, xx + 1):
            oled.pixel(cx + xx2, cy + yy, color)

def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v

# =========================
# SETUP
# =========================
oled.init()
oled.clear()
oled.text("IMU Level", 0, 0)
oled.text("Calibrando...", 0, 12)
oled.show()

print("Calibrando... deixe parado")
mihuIMU1.calibrate()
sleep_ms(500)

CX, CY = 90, 36
R = 26
BALL_R = 3
ANGLE_LIMIT = 25.0

alpha = 0.25
fx = 0.0
fy = 0.0

# manda ~50 Hz
period_ms = 100
t0 = ticks_ms()

# =========================
# LOOP
# =========================
while True:
    # eixo trocado
    pitch = PITCH_SIGN * mihuIMU1.getSensorAngle(PITCH_AXIS)
    roll  = ROLL_SIGN  * mihuIMU1.getSensorAngle(ROLL_AXIS)

    # roll -> X na tela, pitch -> Y na tela
    nx = clamp(roll,  -ANGLE_LIMIT, ANGLE_LIMIT) / ANGLE_LIMIT
    ny = clamp(pitch, -ANGLE_LIMIT, ANGLE_LIMIT) / ANGLE_LIMIT

    # suaviza
    fx = (1 - alpha) * fx + alpha * nx
    fy = (1 - alpha) * fy + alpha * ny

    max_dist = R - BALL_R - 1
    x = int(CX + fx * max_dist)
    y = int(CY - fy * max_dist)  # Y invertido pra ficar natural

    # limita ao círculo
    dx = x - CX
    dy = y - CY
    dist = math.sqrt(dx*dx + dy*dy)
    if dist > max_dist and dist > 0:
        scale = max_dist / dist
        x = int(CX + dx * scale)
        y = int(CY + dy * scale)

    oled.clear()
    oled.text("Nivelamento", 20, 0)
    oled.text("P:%+.1f" % pitch, 0, 45)
    oled.text("R:%+.1f" % roll, 0, 55)
    
    print("%d,%.2f,%.2f" % (ticks_diff(ticks_ms(), t0), pitch, roll))
    
    if pitch <= -12:
        digitalWrite(LED,0x00)
    else:
        digitalWrite(LED,0x01)
        
    draw_circle(CX, CY, R, 1)

    # cruz no centro
    for i in range(-R, R + 1, 4):
        oled.pixel(CX + i, CY, 1)
        oled.pixel(CX, CY + i, 1)

    fill_circle(x, y, BALL_R, 1)

    oled.show()
    
    key = read_fast()
    
    if key in ("UP", "LEFT"):
        oled.clear()
        oled.text("IMU Level", 0, 0)
        oled.text("Calibrando...", 0, 12)
        oled.show()

        print("Calibrando... deixe parado")
        mihuIMU1.calibrate()
        sleep_ms(500)
        
        
    sleep_ms(period_ms)
