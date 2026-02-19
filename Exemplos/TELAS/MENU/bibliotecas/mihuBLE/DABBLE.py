from lib.mihuBLE.BLE_CONTROLLER import BLEUART
import math

MODE_DIGITAL  = 0
MODE_JOYSTICK = 1
MODE_ACCEL    = 2

FUNC_GAMEPAD = 0x02

START_MASK    = 0x01
SELECT_MASK   = 0x02
TRIANGLE_MASK = 0x04
CIRCLE_MASK   = 0x08
CROSS_MASK    = 0x10
SQUARE_MASK   = 0x20

UP_MASK    = 0x01
DOWN_MASK  = 0x02
LEFT_MASK  = 0x04
RIGHT_MASK = 0x08

PI = 3.14159


class DabbleGamePad:

    def __init__(self, name="MIHU-DABBLE"):
        self._ble = BLEUART(name)
        self.mode = MODE_DIGITAL
        self.buttons = 0
        self.value = 0

    def any(self):
        return self._ble.available()

    def update(self):
        raw = self._ble.read()
        if not raw or not isinstance(raw, (bytes, bytearray)):
            return False

        if raw[0] != 0xFF:
            return False

        if len(raw) < 7 or raw[4] != FUNC_GAMEPAD:
            return False

        self.buttons = raw[5]
        self.value   = raw[6]

        # =================================================
        # DETECÇÃO CORRETA DE MODO (BYTE raw[2])
        # =================================================
        if raw[2] == 0x01:
            self.mode = MODE_DIGITAL

        elif raw[2] == 0x02:
            if raw[6] == 0x03:
                self.mode = MODE_ACCEL
            else:
                self.mode = MODE_JOYSTICK

        return True

    # ---------------- BOTÕES ----------------

    def is_start(self):     return bool(self.buttons & START_MASK)
    def is_select(self):   return bool(self.buttons & SELECT_MASK)
    def is_triangle(self): return bool(self.buttons & TRIANGLE_MASK)
    def is_circle(self):   return bool(self.buttons & CIRCLE_MASK)
    def is_cross(self):    return bool(self.buttons & CROSS_MASK)
    def is_square(self):   return bool(self.buttons & SQUARE_MASK)

    # ---------------- DIGITAL ----------------

    def is_up(self):
        return self.mode == MODE_DIGITAL and bool(self.value & UP_MASK)

    def is_down(self):
        return self.mode == MODE_DIGITAL and bool(self.value & DOWN_MASK)

    def is_left(self):
        return self.mode == MODE_DIGITAL and bool(self.value & LEFT_MASK)

    def is_right(self):
        return self.mode == MODE_DIGITAL and bool(self.value & RIGHT_MASK)

    # ---------------- JOYSTICK ----------------

    def get_angle(self):
        if self.mode == MODE_JOYSTICK:
            return (self.value >> 3) * 15
        return 0

    def get_radius(self):
        if self.mode == MODE_JOYSTICK:
            return self.value & 0x07
        return 0

    def get_x(self):
        if self.mode == MODE_JOYSTICK:
            return self.get_radius() * math.cos(self.get_angle() * PI / 180)
        return 0.0

    def get_y(self):
        if self.mode == MODE_JOYSTICK:
            return self.get_radius() * math.sin(self.get_angle() * PI / 180)
        return 0.0

    # ---------------- ACCEL ----------------

    def is_accel_mode(self):
        return self.mode == MODE_ACCEL
