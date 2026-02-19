
'''
import bluetooth
import struct
import time

# =====================================================
# UUIDs BLE UART (NUS)
# =====================================================

_UART_UUID = bluetooth.UUID("6E400001-B5A3-F393-E0A9-E50E24DCCA9E")
_UART_TX   = bluetooth.UUID("6E400003-B5A3-F393-E0A9-E50E24DCCA9E")
_UART_RX   = bluetooth.UUID("6E400002-B5A3-F393-E0A9-E50E24DCCA9E")

# FLAGS (NÃO usar const aqui)
_UART_TX_FLAG = bluetooth.FLAG_NOTIFY
_UART_RX_FLAG = bluetooth.FLAG_WRITE

# IRQ EVENTS
_IRQ_CENTRAL_CONNECT    = 1
_IRQ_CENTRAL_DISCONNECT = 2
_IRQ_GATTS_WRITE        = 3

# =====================================================
# BLE UART
# =====================================================

class BLEUART:
    def __init__(self, name="MIHU-BLE"):
        self._ble = bluetooth.BLE()
        self._ble.active(True)
        self._ble.irq(self._irq)

        ((self._tx_handle, self._rx_handle),) = self._ble.gatts_register_services((
            (_UART_UUID, (
                (_UART_TX, _UART_TX_FLAG),
                (_UART_RX, _UART_RX_FLAG),
            )),
        ))

        self._connections = set()
        self._rx_queue = []   # <-- fila de mensagens

        self._payload = self._advertising_payload(name)
        self._advertise()

        print("[BLE] UART ativo:", name)

    # -------------------------------------------------
    def _irq(self, event, data):
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, _, _ = data
            self._connections.add(conn_handle)
            print("[BLE] Conectado:", conn_handle)

        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, _, _ = data
            self._connections.discard(conn_handle)
            print("[BLE] Desconectado")
            self._advertise()

        elif event == _IRQ_GATTS_WRITE:
            conn_handle, value_handle = data
            if value_handle == self._rx_handle:
                msg = self._ble.gatts_read(self._rx_handle)
                try:
                    txt = msg.decode().strip()
                except:
                    txt = str(msg)
                self._rx_queue.append(txt)
                print("[BLE] RX:", txt)

    # -------------------------------------------------
    def available(self):
        return len(self._rx_queue) > 0

    def read(self):
        if self._rx_queue:
            return self._rx_queue.pop(0)
        return None

    # -------------------------------------------------
    def write(self, data):
        if not self._connections:
            return  # ninguém conectado

        if isinstance(data, str):
            data = data.encode()

        for conn_handle in list(self._connections):
            try:
                self._ble.gatts_notify(conn_handle, self._tx_handle, data)
            except OSError as e:
                # erro -30 é comum → remove conexão inválida
                print("[BLE] Notify erro:", e)
                self._connections.discard(conn_handle)

    # -------------------------------------------------
    def _advertise(self):
        self._ble.gap_advertise(
            100_000,
            adv_data=self._payload
        )

    # -------------------------------------------------
    def _advertising_payload(self, name):
        payload = bytearray()

        def _append(adv_type, value):
            payload.extend(struct.pack("BB", len(value) + 1, adv_type))
            payload.extend(value)

        _append(0x01, b"\x06")  # flags
        _append(0x09, name.encode())

        return payload

'''

import bluetooth
import struct

_UART_UUID = bluetooth.UUID("6E400001-B5A3-F393-E0A9-E50E24DCCA9E")
_UART_TX   = bluetooth.UUID("6E400003-B5A3-F393-E0A9-E50E24DCCA9E")
_UART_RX   = bluetooth.UUID("6E400002-B5A3-F393-E0A9-E50E24DCCA9E")

_UART_TX_FLAG = bluetooth.FLAG_NOTIFY
_UART_RX_FLAG = bluetooth.FLAG_WRITE

_IRQ_CENTRAL_CONNECT    = 1
_IRQ_CENTRAL_DISCONNECT = 2
_IRQ_GATTS_WRITE        = 3


class BLEUART:
    def __init__(self, name="MIHU-BLE"):
        self._ble = bluetooth.BLE()
        self._ble.active(True)
        self._ble.irq(self._irq)

        ((self._tx_handle, self._rx_handle),) = self._ble.gatts_register_services((
            (_UART_UUID, (
                (_UART_TX, _UART_TX_FLAG),
                (_UART_RX, _UART_RX_FLAG),
            )),
        ))

        self._connections = set()
        self._rx_queue = []

        self._payload = self._adv_payload(name)
        self._advertise()

        print("[BLE] UART ativo:", name)

    # -------------------------------------------------
    def _irq(self, event, data):
        if event == _IRQ_CENTRAL_CONNECT:
            conn, _, _ = data
            self._connections.add(conn)
            print("[BLE] Conectado")

        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn, _, _ = data
            self._connections.discard(conn)
            print("[BLE] Desconectado")
            self._advertise()

        elif event == _IRQ_GATTS_WRITE:
            conn, value = data
            if value == self._rx_handle:
                msg = self._ble.gatts_read(self._rx_handle)
                self._rx_queue.append(msg)
                print("[BLE] RX:", msg)

    # -------------------------------------------------
    def available(self):
        return len(self._rx_queue) > 0

    def read(self):
        if self._rx_queue:
            return self._rx_queue.pop(0)
        return None

    # -------------------------------------------------
    def write(self, data):
        if not self._connections:
            return

        if isinstance(data, str):
            data = data.encode()

        for conn in list(self._connections):
            try:
                self._ble.gatts_notify(conn, self._tx_handle, data)
            except OSError:
                self._connections.discard(conn)

    # -------------------------------------------------
    def _advertise(self):
        self._ble.gap_advertise(100_000, adv_data=self._payload)

    def _adv_payload(self, name):
        payload = bytearray()

        def _append(t, v):
            payload.extend(struct.pack("BB", len(v) + 1, t))
            payload.extend(v)

        _append(0x01, b"\x06")
        _append(0x09, name.encode())

        return payload
