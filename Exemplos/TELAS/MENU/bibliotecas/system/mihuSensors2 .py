from machine import UART, Pin, ADC
import _thread
import time
import math

from ev3uart import EV3UARTSensor, DATA_MODE, TYPE_COLOR

# ============================================================
# CONSTANTES DE PORTA
# ============================================================

P1, P1_RX, P1_TX, P1_ADC = 1, 18, 44, 1
P2, P2_RX, P2_TX, P2_ADC = 2, 15, 16, 2
P3, P3_RX, P3_TX, P3_ADC = 3, 17, 43, 3

ADC_SENSOR_PRESENTE = 300

# Tipos EV3
TYPE_ULTRA = 30
TYPE_GYRO  = 32
TYPE_IR    = 33

# Modos
REFLEXAO = 0
AMBIENTE = 1
COR      = 2

MILIMETRO  = 0
CENTIMETRO = 1

MODE_PROX   = 0
MODE_SEEK   = 1
MODE_REMOTE = 2

# ============================================================
# ADC – DETECÇÃO FÍSICA
# ============================================================

_adcP1 = ADC(Pin(P1_ADC))
_adcP2 = ADC(Pin(P2_ADC))
_adcP3 = ADC(Pin(P3_ADC))

for _adc in (_adcP1, _adcP2, _adcP3):
    _adc.atten(ADC.ATTN_11DB)
    _adc.width(ADC.WIDTH_12BIT)

def _sensor_conectado_adc(adc):
    try:
        return adc.read() < ADC_SENSOR_PRESENTE
    except:
        return False

# ============================================================
# SENSOR VIEW (ESTADO)
# ============================================================

class SensorView:
    def __init__(self):
        self.active    = False
        self.hasData   = False
        self.value     = math.nan
        self.mode      = -1
        self.want_mode = None
        self.status    = 0

svA, svB, svC = SensorView(), SensorView(), SensorView()

# ============================================================
# MUTEX
# ============================================================

try:
    mtxA, mtxB, mtxC = _thread.allocate_lock(), _thread.allocate_lock(), _thread.allocate_lock()
except:
    class _Dummy:
        def __enter__(self): pass
        def __exit__(self, *a): pass
    mtxA = mtxB = mtxC = _Dummy()

# ============================================================
# EV3 UART
# ============================================================

EV3A = EV3UARTSensor(UART(0, baudrate=2400, tx=P1_TX, rx=P1_RX))
EV3B = EV3UARTSensor(UART(1, baudrate=2400, tx=P2_TX, rx=P2_RX))
EV3C = EV3UARTSensor(UART(2, baudrate=2400, tx=P3_TX, rx=P3_RX))

# 👉 PADRÃO DEFINITIVO: 4 ELEMENTOS
# (sensor, view, lock, adc)
PORTS = {
    P1: (EV3A, svA, mtxA, _adcP1),
    P2: (EV3B, svB, mtxB, _adcP2),
    P3: (EV3C, svC, mtxC, _adcP3),
}

# ============================================================
# ENGINE
# ============================================================

_engine_started = False

def mihuStartSensor():
    global _engine_started
    if _engine_started:
        return
    _engine_started = True

    for sensor, view, lock, adc in PORTS.values():
        _thread.start_new_thread(_taskEV3, (sensor, view, lock, adc))

# ============================================================
# THREAD EV3 (ÚNICO DONO DO set_mode)
# ============================================================

def _taskEV3(sensor, view, lock, adc):

    while True:
        conectado = _sensor_conectado_adc(adc)

        if not conectado:
            view.active    = False
            view.hasData   = False
            view.mode      = -1
            view.want_mode = None
            time.sleep_ms(20)
            continue

        if not view.active:
            with lock:
                sensor.begin()
            view.active = True
            view.mode   = -1

        try:
            with lock:
                sensor.check()

                if view.want_mode is not None:
                    if sensor.get_current_mode() != view.want_mode:
                        sensor.set_mode(view.want_mode)
                        view.hasData = False
                    else:
                        view.want_mode = None

                if sensor.get_status() == DATA_MODE:
                    buf = [0.0] * max(1, sensor.sample_size())
                    sensor.fetch_sample(buf)

                    view.value   = buf[0]
                    view.mode    = sensor.get_current_mode()
                    view.status  = DATA_MODE
                    view.hasData = True
                else:
                    view.hasData = False

        except:
            view.hasData = False

        time.sleep_ms(2)

# ============================================================
# API PÚBLICA
# ============================================================

def requestSensorMode(porta, modo):
    _, view, _, _ = PORTS.get(porta, (None, None, None, None))
    if view:
        view.want_mode = modo

def getSensorStatus(porta):
    _, view, _, _ = PORTS.get(porta, (None, None, None, None))
    return "OK" if view and view.active else "LIVRE"

def getSensorMode(porta):
    _, view, _, _ = PORTS.get(porta, (None, None, None, None))
    return view.mode if view and view.active else None

def getSensorType(porta):
    sensor, view, _, _ = PORTS.get(porta, (None, None, None, None))
    if not view or not view.active:
        return None
    return sensor.get_type()

def getSensorTypeName(porta):
    return {
        TYPE_COLOR: "COR",
        TYPE_ULTRA: "ULTRASSONICO",
        TYPE_GYRO:  "GIRO",
        TYPE_IR:    "INFRAVERMELHO"
    }.get(getSensorType(porta), "SEM SENSOR")

# ============================================================
# LEITURA – COR
# ============================================================

def getSensorColor(porta):
    _, view, _, _ = PORTS.get(porta, (None, None, None, None))
    return int(view.value) if view and view.hasData else math.nan

# ============================================================
# ULTRASSÔNICO
# ============================================================

def getSensorUltra(porta, unidade=CENTIMETRO):
    sensor, view, lock, _ = PORTS.get(porta, (None, None, None, None))
    if not sensor or not view or not view.active:
        return math.nan

    with lock:
        if sensor.get_current_mode() != 0:
            sensor.set_mode(0)
            view.hasData = False
            return math.nan

        sensor.check()
        if sensor.get_status() != DATA_MODE:
            return math.nan

        buf = [0.0]
        sensor.fetch_sample(buf)
        val = buf[0]

    return val / 10.0 if unidade == CENTIMETRO else val

# ============================================================
# GIROSCÓPIO
# ============================================================

def getSensorGiroscopio(porta):
    sensor, view, lock, _ = PORTS.get(porta, (None, None, None, None))
    if not sensor or not view or not view.active:
        return math.nan

    with lock:
        if sensor.get_type() != TYPE_GYRO:
            return math.nan
        if sensor.get_current_mode() != 0:
            sensor.set_mode(0)

        buf = [0.0]
        sensor.fetch_sample(buf)
        return buf[0]

# ============================================================
# INFRAVERMELHO
# ============================================================

def distanciaIR(porta):
    sensor, view, lock, _ = PORTS.get(porta, (None, None, None, None))
    if not sensor or not view or not view.active:
        return math.nan

    with lock:
        if sensor.get_type() != TYPE_IR:
            return math.nan
        if sensor.get_current_mode() != MODE_PROX:
            sensor.set_mode(MODE_PROX)

        buf = [0.0]
        sensor.fetch_sample(buf)
        return int(round(buf[0]))

def anguloIR(porta, canal):
    if canal not in (1,2,3,4):
        return math.nan

    sensor, view, lock, _ = PORTS.get(porta, (None, None, None, None))
    if not sensor or not view or not view.active:
        return math.nan

    with lock:
        if sensor.get_type() != TYPE_IR:
            return math.nan
        if sensor.get_current_mode() != MODE_SEEK:
            sensor.set_mode(MODE_SEEK)

        buf = [0.0] * sensor.sample_size()
        sensor.fetch_sample(buf)

    i = (canal - 1) * 2
    return (int(buf[i]), int(buf[i+1])) if i+1 < len(buf) else math.nan

def infoIR(porta, canal):
    if canal not in (1,2,3,4):
        return math.nan

    sensor, view, lock, _ = PORTS.get(porta, (None, None, None, None))
    if not sensor or not view or not view.active:
        return math.nan

    with lock:
        if sensor.get_type() != TYPE_IR:
            return math.nan
        if sensor.get_current_mode() != MODE_REMOTE:
            sensor.set_mode(MODE_REMOTE)

        buf = [0.0] * sensor.sample_size()
        sensor.fetch_sample(buf)

    idx = canal - 1
    return int(buf[idx]) if idx < len(buf) else math.nan

# ============================================================
# ESTADO
# ============================================================

def hasSensorData(porta):
    _, view, _, _ = PORTS.get(porta, (None, None, None, None))
    return bool(view and view.hasData)
