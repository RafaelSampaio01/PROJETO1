from time import ticks_ms, sleep_ms
import machine
import socket

from lib.mihuOled import mihuOled as oled
from lib.mihuBLE import mihuBLE
from system.wifi_widget import WifiWidget
from system.ble_widget import BleWidget


# =====================================================
# ESTADO GLOBAL (ponte BLE <-> WIFI)
# =====================================================
STATE = {
    "led": False,
    "last_cmd": ""
}


# =====================================================
# HTML
# =====================================================
def build_html(ip, state):
    led = "ON" if state["led"] else "OFF"

    return """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>MIHU OS</title>
<style>
body {{
    font-family: Arial;
    background: #111;
    color: #0f0;
    padding: 20px;
}}
button {{
    padding: 12px;
    font-size: 16px;
    margin: 5px;
}}
.box {{
    border: 1px solid #0f0;
    padding: 10px;
    margin-bottom: 10px;
}}
</style>
</head>
<body>

<h1>MIHU OS</h1>

<div class="box">
<b>IP:</b> {ip}<br>
<b>LED:</b> {led}<br>
<b>Último comando:</b> {cmd}
</div>

<button onclick="fetch('/cmd?led=on')">LED ON</button>
<button onclick="fetch('/cmd?led=off')">LED OFF</button>

</body>
</html>
""".format(
        ip=ip or "SEM IP",
        led=led,
        cmd=state["last_cmd"]
    )


# =====================================================
# HTTP SERVER
# =====================================================
http_socket = None


def http_start(ip):
    global http_socket
    if http_socket:
        return

    addr = socket.getaddrinfo(ip, 80)[0][-1]
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(addr)
    s.listen(1)
    s.settimeout(0.05)

    http_socket = s
    print("HTTP server ativo:", ip)


def http_update(ip):
    global http_socket
    if not http_socket or not ip:
        return

    try:
        conn, addr = http_socket.accept()
    except:
        return

    try:
        req = conn.recv(1024).decode()

        # ----------------------------
        # HTML -> ESP -> BLE
        # ----------------------------
        if "/cmd?" in req:
            if "led=on" in req:
                STATE["led"] = True
                STATE["last_cmd"] = "HTML → LED ON"
                mihuBLE.send("led on")

            elif "led=off" in req:
                STATE["led"] = False
                STATE["last_cmd"] = "HTML → LED OFF"
                mihuBLE.send("led off")

        html = build_html(ip, STATE)

        conn.send("HTTP/1.1 200 OK\r\n")
        conn.send("Content-Type: text/html\r\n")
        conn.send("Connection: close\r\n\r\n")
        conn.send(html)

    except Exception as e:
        print("HTTP error:", e)

    try:
        conn.close()
    except:
        pass


# =====================================================
# INIT OLED
# =====================================================
oled.init()
oled.clear()
oled.show()
# =====================================================
# WIFI
# =====================================================
wifi_ui = WifiWidget(oled, x=0, y=0)
wifi_ui.set_credentials("moto g05", "1234567890")
wifi_ui.set_enabled(True)
# =====================================================
# BLE
# =====================================================
ble_ui = BleWidget(oled, x=22, y=0)
ble_enable(name="MIHU_007")

# =====================================================
# LOOP PRINCIPAL
# =====================================================
http_started = False
last_ip = None

while True:
    now = ticks_ms()
    dirty = False

    # --- UI ---
    dirty |= wifi_ui.update(now)
    dirty |= ble_ui.update(now)
    if dirty:
        oled.show()

    # -------------------------------------------------
    # BLE -> ESP -> WIFI (HTML)
    # -------------------------------------------------
    cmd = mihuBLE.recv()
    if cmd:
        cmd = cmd.strip().lower()

        if cmd == "led on":
            STATE["led"] = True
            STATE["last_cmd"] = "BLE → LED ON"

        elif cmd == "led off":
            STATE["led"] = False
            STATE["last_cmd"] = "BLE → LED OFF"

    # -------------------------------------------------
    # HTTP
    # -------------------------------------------------
    ip = wifi_ui.get_ip()

    if ip and not http_started:
        http_start(ip)
        http_started = True

    http_update(ip)

    # debug
    if ip and ip != last_ip:
        print("IP:", ip)
        last_ip = ip

    machine.idle()
    sleep_ms(30)
