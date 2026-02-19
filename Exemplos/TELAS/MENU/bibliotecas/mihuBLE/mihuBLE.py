# lib/mihuBLE.py
# BLE UART (NUS) simples:
# - Trocar nome (re-advertise)
# - Enviar texto (notify)
# - Receber comandos (write), por linha \n
# - Callback opcional on_command(cb)

import bluetooth
from micropython import const

# IRQ events
_IRQ_CENTRAL_CONNECT    = const(1)
_IRQ_CENTRAL_DISCONNECT = const(2)
_IRQ_GATTS_WRITE        = const(3)

# GATT flags
_FLAG_WRITE_NO_RESPONSE = const(0x0004)
_FLAG_WRITE             = const(0x0008)
_FLAG_NOTIFY            = const(0x0010)

# Nordic UART Service (NUS)
_UART_UUID = bluetooth.UUID("6E400001-B5A3-F393-E0A9-E50E24DCCA9E")
_UART_TX   = (bluetooth.UUID("6E400003-B5A3-F393-E0A9-E50E24DCCA9E"), _FLAG_NOTIFY)  # ESP -> Phone
_UART_RX   = (bluetooth.UUID("6E400002-B5A3-F393-E0A9-E50E24DCCA9E"),
              _FLAG_WRITE | _FLAG_WRITE_NO_RESPONSE)  # Phone -> ESP
_UART_SVC  = (_UART_UUID, (_UART_TX, _UART_RX))

# ===== estado interno (singleton) =====
_ble = None
_tx_h = None
_rx_h = None
_conns = set()
_name = "MIHU BLE 001"

_buf = bytearray()
_queue = []              # fila de linhas recebidas
_queue_max = 20          # limite pra não explodir RAM
_cb = None               # callback on_command


def _adv_payload(name=None, services=None):
    payload = bytearray()

    def _append(t, v):
        payload.extend(bytes((len(v) + 1, t)) + v)

    _append(0x01, b"\x06")  # flags

    if name:
        nb = name.encode()
        # curto p/ caber no ADV (evita erro -18)
        if len(nb) > 8:
            _append(0x08, nb[:8])  # Shortened Local Name
        else:
            _append(0x09, nb)      # Complete Local Name

    if services:
        for uuid in services:
            b = bytes(uuid)
            if len(b) == 16:
                _append(0x07, b)   # 128-bit UUID

    return payload


def _advertise():
    # ADV curto (nome) + Scan Response (UUID) -> cabe nos 31 bytes
    adv  = _adv_payload(name=_name)
    resp = _adv_payload(services=[_UART_UUID])
    _ble.gap_advertise(100_000, adv_data=adv, resp_data=resp)


def _push_line(s):
    # enfileira e chama callback
    global _queue
    if len(_queue) >= _queue_max:
        _queue.pop(0)
    _queue.append(s)

    if _cb:
        try:
            _cb(s)
        except Exception as e:
            # evita quebrar IRQ por erro do usuário
            pass


def _irq(event, data):
    global _buf

    if event == _IRQ_CENTRAL_CONNECT:
        conn, _, _ = data
        _conns.add(conn)

    elif event == _IRQ_CENTRAL_DISCONNECT:
        conn, _, _ = data
        _conns.discard(conn)
        _advertise()

    elif event == _IRQ_GATTS_WRITE:
        conn, value_handle = data
        if value_handle != _rx_h:
            return

        raw = _ble.gatts_read(_rx_h)
        if not raw:
            return

        _buf += raw

        # processa por linhas
        while True:
            i = _buf.find(b"\n")
            if i < 0:
                break
            line = _buf[:i].strip(b"\r")
            _buf = _buf[i + 1:]

            try:
                s = line.decode().strip()
            except:
                s = str(line)

            if s:
                _push_line(s)


# ===== API pública =====

def start(name="MIHU"):
    """Inicia BLE NUS com nome. Chame 1 vez."""
    global _ble, _tx_h, _rx_h, _name, _buf, _queue

    _name = str(name)

    if _ble is None:
        _ble = bluetooth.BLE()
        _ble.active(True)
        _ble.irq(_irq)

        (( _tx_h, _rx_h ),) = _ble.gatts_register_services((_UART_SVC,))
        _buf = bytearray()
        _queue = []

    _advertise()
    return True


def stop():
    """Para BLE (desliga rádio)."""
    global _ble, _tx_h, _rx_h, _conns
    if _ble:
        try:
            _ble.active(False)
        except:
            pass
    _ble = None
    _tx_h = None
    _rx_h = None
    _conns = set()
    return True


def set_name(name):
    """Troca nome e reanuncia (vale para próximas conexões)."""
    global _name
    _name = str(name)
    if _ble:
        _advertise()
    return True


def connected():
    """Retorna True se tiver alguém conectado."""
    return bool(_conns)


def send(text):
    """Envia texto para o celular (notify TX)."""
    if not _ble or _tx_h is None or not _conns:
        return False

    if not isinstance(text, (bytes, bytearray)):
        data = (str(text) + "\n").encode()
    else:
        data = text
        if not data.endswith(b"\n"):
            data += b"\n"

    ok = False
    for c in list(_conns):
        try:
            _ble.gatts_notify(c, _tx_h, data)
            ok = True
        except:
            pass
    return ok


def available():
    """Tem comando recebido na fila?"""
    return len(_queue) > 0


def recv():
    """Lê 1 comando (linha) da fila. Retorna str ou None."""
    if _queue:
        return _queue.pop(0)
    return None


def clear():
    """Limpa fila de comandos."""
    _queue.clear()


def on_command(callback):
    """Define callback: callback(cmd_str). Use None para desligar."""
    global _cb
    _cb = callback
    return True

