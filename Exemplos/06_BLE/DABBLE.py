from lib.mihuBLE.BLE_CONTROLLER import BLEUART
import math

# ===============================
# MODOS
# ===============================

MODE_DIGITAL  = 0
MODE_JOYSTICK = 1
MODE_ACCEL    = 2

FUNC_GAMEPAD = 0x02

# ===============================
# BOTÕES
# ===============================

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

# ===============================
# NORMALIZAÇÃO
# ===============================

JOY_MAX_RADIUS = 7.0
JOY_MAX_VALUE  = 100
DEAD_ZONE      = 5     # %

PI = 3.14159


class DabbleGamePad:

    def __init__(self, name="MIHU-DABBLE"):
        self._ble = BLEUART(name)

        self.mode = MODE_DIGITAL
        self.buttons = 0
        self.value = 0
        self.accel_raw = 0

        self.gamepad_connected = False

        self._was_active = False
        self._idle_event = False

    # --------------------------------------------------
    def any(self):
        return self._ble.available()

    # --------------------------------------------------
    def update(self):
        raw = self._ble.read()
        if not raw or not isinstance(raw, (bytes, bytearray)):
            return False

        if raw[0] != 0xFF:
            return False

        # -------------------------------
        # EVENTO DE CONEXÃO
        # -------------------------------
        if raw == b'\xff\x00\x03\x00\x00\x00':
            self.gamepad_connected = True
            print("🎮 GamePad conectado")
            return False

        if len(raw) < 7 or raw[4] != FUNC_GAMEPAD:
            return False

        self.buttons = raw[5]
        self.value   = raw[6]

        # -------------------------------
        # MODO
        # -------------------------------
        if raw[2] == 0x01:
            self.mode = MODE_DIGITAL

        elif raw[2] == 0x02:
            self.mode = MODE_JOYSTICK

        elif raw[2] == 0x03:
            self.mode = MODE_ACCEL
            self.accel_raw = raw[6]

        # -------------------------------
        # DETECÇÃO DE ATIVIDADE
        # -------------------------------
        active = False

        if self.buttons != 0:
            active = True

        elif self.mode in (MODE_DIGITAL, MODE_JOYSTICK) and self.value != 0:
            active = True

        elif self.mode == MODE_ACCEL and abs(self.accel_value()) > 0.05:
            active = True

        # evento de soltar tudo
        self._idle_event = self._was_active and not active
        self._was_active = active

        return True

    # ===============================
    # EVENTOS
    # ===============================

    def is_idle_event(self):
        if self._idle_event:
            self._idle_event = False
            return True
        return False

    # ===============================
    # BOTÕES
    # ===============================

    def is_start(self):     return bool(self.buttons & START_MASK)
    def is_select(self):   return bool(self.buttons & SELECT_MASK)
    def is_triangle(self): return bool(self.buttons & TRIANGLE_MASK)
    def is_circle(self):   return bool(self.buttons & CIRCLE_MASK)
    def is_cross(self):    return bool(self.buttons & CROSS_MASK)
    def is_square(self):   return bool(self.buttons & SQUARE_MASK)

    # ===============================
    # DIGITAL
    # ===============================

    def is_up(self):
        return self.mode == MODE_DIGITAL and bool(self.value & UP_MASK)

    def is_down(self):
        return self.mode == MODE_DIGITAL and bool(self.value & DOWN_MASK)

    def is_left(self):
        return self.mode == MODE_DIGITAL and bool(self.value & LEFT_MASK)

    def is_right(self):
        return self.mode == MODE_DIGITAL and bool(self.value & RIGHT_MASK)

    # ===============================
    # JOYSTICK RAW
    # ===============================

    def get_angle(self):
        if self.mode != MODE_JOYSTICK:
            return 0
        return (self.value >> 3) * 15

    def get_radius(self):
        if self.mode != MODE_JOYSTICK:
            return 0
        return self.value & 0x07

    def get_x(self):
        if self.mode != MODE_JOYSTICK:
            return 0.0
        return self.get_radius() * math.cos(self.get_angle() * PI / 180)

    def get_y(self):
        if self.mode != MODE_JOYSTICK:
            return 0.0
        return self.get_radius() * math.sin(self.get_angle() * PI / 180)

    # ===============================
    # NORMALIZAÇÃO
    # ===============================

    def _norm(self, v, vmax):
        n = int((v / vmax) * JOY_MAX_VALUE)

        if abs(n) < DEAD_ZONE:
            return 0

        if n >  100: return  100
        if n < -100: return -100
        return n

    def joy_x(self):
        return self._norm(self.get_x(), JOY_MAX_RADIUS)

    def joy_y(self):
        return self._norm(self.get_y(), JOY_MAX_RADIUS)

    # ===============================
    # ACCEL
    # ===============================

    def accel_value(self):
        if self.mode != MODE_ACCEL:
            return 0.0
        return (self.accel_raw - 128) / 128.0

    def accel(self):
        return self._norm(self.accel_value(), 1.0)

    # ===============================
    # CONTROLE DE ROBÔ (JOYSTICK)
    # ===============================

    def drive(self, motor_esq, motor_dir, set_motor_func):
        """
        Controle diferencial com joystick
        """
        if self.mode != MODE_JOYSTICK:
            set_motor_func(motor_esq, 0)
            set_motor_func(motor_dir, 0)
            return

        frente = self.joy_y()
        curva  = self.joy_x()

        vel_esq = frente + curva
        vel_dir = frente - curva

        vel_esq = max(-100, min(100, vel_esq))
        vel_dir = max(-100, min(100, vel_dir))

        set_motor_func(motor_esq, vel_esq)
        set_motor_func(motor_dir, vel_dir)

    # ===============================
    # CONTROLE DE ROBÔ (ACEL)
    # ===============================

    def drive_accel(self, motor_esq, motor_dir, set_motor_func, ganho=100):
        """
        Controle diferencial usando acelerômetro
        """
        if self.mode != MODE_ACCEL:
            set_motor_func(motor_esq, 0)
            set_motor_func(motor_dir, 0)
            return

        frente = self.accel()
        curva  = self.joy_x()   # lateral se existir

        frente = int(frente * ganho / 100)
        curva  = int(curva  * ganho / 100)

        vel_esq = frente + curva
        vel_dir = frente - curva

        vel_esq = max(-100, min(100, vel_esq))
        vel_dir = max(-100, min(100, vel_dir))

        set_motor_func(motor_esq, vel_esq)
        set_motor_func(motor_dir, vel_dir)


    # ===============================
    # DEBUG ACCEL
    # ===============================

    def accel_raw_value(self):
        """Retorna o valor bruto recebido (0–255)"""
        return self.accel_raw if self.mode == MODE_ACCEL else None

    def accel_norm(self):
        """Retorna valor normalizado -1.0 .. +1.0"""
        return self.accel_value()

    def accel_percent(self):
        """Retorna valor pedagógico -100 .. +100"""
        return self.accel()
