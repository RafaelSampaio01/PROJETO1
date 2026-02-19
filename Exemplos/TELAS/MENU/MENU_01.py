# =========================================================
# IMPORTS
# =========================================================
from time import ticks_ms, ticks_diff, sleep_ms
import time
import machine
import ntptime

from lib.mihuOled import mihuOled as oled
from lib.mihuButton.mihuButton import read_menu
from lib.mihuOled.icons.icons_menu import *

from system.wifi_widget import WifiWidget
from system.ble_widget import BleWidget
from system.batt_widget_ads import BattWidgetADS

from lib.mihuBLE import mihuBLE


#SubPage

from system.mihuAtuadores import show as getAtuadores

# =========================================================
# INIT OLED
# =========================================================
oled.init()
oled.clear()
oled.show()

W = oled.oled().width
H = oled.oled().height

sleep_ms(800)


# =========================================================
# I2C (OLED + ADS COMPARTILHAM)
# =========================================================
i2c = machine.I2C(
    0,
    sda=machine.Pin(39),
    scl=machine.Pin(40),
    freq=400000
)


# =========================================================
# WIFI / BLE / BATT (BARRA SUPERIOR)
# =========================================================
wifi_ui = WifiWidget(oled, x=0, y=0)
wifi_ui.set_credentials("moto g05", "1234567890")
sleep_ms(400)
wifi_ui.set_enabled(True)

ble_ui = BleWidget(oled, x=20, y=0)
ble_ui.set_enabled(True, "MIHU_001")

batt_ui = BattWidgetADS(
    oled,
    i2c=i2c,
    adc_addr=0x49,
    channel=0,
    x=W - 35,
    y=0,
    v_min=4.5,
    v_max=8.4,
    divider_factor=3.8
)


# =========================================================
# TIME (NTP)
# =========================================================
TIMEZONE = -3 * 3600
time_synced = False

def sync_time():
    global time_synced
    try:
        ntptime.settime()
        time_synced = True
    except:
        time_synced = False

def get_hhmm():
    t = time.time() + TIMEZONE
    tm = time.localtime(t)
    return "%02d:%02d" % (tm[3], tm[4])

def get_ddmm():
    t = time.time() + TIMEZONE
    tm = time.localtime(t)
    return "%02d/%02d" % (tm[2], tm[1])


# =========================================================
# CLOCK UI (HORA / DATA)
# =========================================================
CLOCK_X = 44
CLOCK_Y = 0
clock_mode = 0
last_clock_toggle = 0
CLOCK_TOGGLE_MS = 4000

def draw_clock():
    oled.fill_rect(CLOCK_X, CLOCK_Y, 40, 8, 0)
    if not time_synced:
        oled.text("--:--", CLOCK_X, CLOCK_Y)
    else:
        oled.text(
            get_hhmm() if clock_mode == 0 else get_ddmm(),
            CLOCK_X,
            CLOCK_Y
        )


# =========================================================
# MENU
# =========================================================
MENU = [
    ("INICIAR O MIXLY", play_icons),
    ("LISTA THONNY", thonny_icons),
    ("APP DABBLE", dabble_icons),
    ("SENSORES", sensor_icons),
    ("ATUADORES", atuador_icons, getAtuadores),
    ("CONFIGURAR", config_icons),
]

idx = 0

ICON_W = 32
ICON_H = 32

CENTER_X = (W - ICON_W) // 2
CENTER_Y = (H - ICON_H) // 2 + 4
LABEL_Y  = H - 10


# =========================================================
# DRAW HELPERS
# =========================================================
def draw_separator():
    oled.hline(0, 16, W, 1)

def clear_center():
    oled.fill_rect(0, 18, W, H - 18, 0)

def draw_item(label, icon, x):
    oled.draw_icon(icon, x, CENTER_Y)
    tw = len(label) * 8
    tx = x + (ICON_W - tw) // 2
    oled.text(label, tx, LABEL_Y)


# =========================================================
# SLIDE EFFECT (MANUAL / SEGURO)
# =========================================================
def slide(old_i, new_i, direction):
    """
    direction = +1  → novo entra da direita
    direction = -1  → novo entra da esquerda
    """
    old_label, old_icon = MENU[old_i]
    new_label, new_icon = MENU[new_i]

    for dx in range(0, W + 1, 16):
        clear_center()

        draw_item(
            old_label,
            old_icon,
            CENTER_X - dx * direction
        )

        draw_item(
            new_label,
            new_icon,
            CENTER_X + (W - dx) * direction
        )

        draw_separator()
        draw_clock()
        oled.show()
        sleep_ms(18)


# =========================================================
# BLE HELPERS
# =========================================================
def ble_connected():
    try:
        return mihuBLE.connected()
    except:
        return False

def ble_send_page():
    if ble_connected():
        label, _ = MENU[idx]
        mihuBLE.send("PAGE:%d:%s" % (idx, label))

def ble_send_enter():
    if ble_connected():
        label, _ = MENU[idx]
        mihuBLE.send("ENTER:%d:%s" % (idx, label))


# =========================================================
# MENU ACTIONS
# =========================================================
def action_next():
    global idx
    new = (idx + 1) % len(MENU)
    slide(idx, new, direction=-1)
    idx = new
    ble_send_page()

def action_prev():
    global idx
    new = (idx - 1) % len(MENU)
    slide(idx, new, direction=+1)
    idx = new
    ble_send_page()

def action_ok():
    print("ENTER:", MENU[idx][0])
    ble_send_enter()


# =========================================================
# BLE → CONTROLE DO MENU
# =========================================================
def handle_ble(cmd):
    cmd = cmd.strip().lower()

    if cmd in ("left", "prev", "l"):
        action_prev()
    elif cmd in ("right", "next", "r"):
        action_next()
    elif cmd in ("ok", "enter", "select"):
        action_ok()


# =========================================================
# PRIMEIRO DESENHO
# =========================================================
oled.clear()
draw_separator()

label, icon = MENU[idx]
draw_item(label, icon, CENTER_X)

now = ticks_ms()
wifi_ui.update(now)
ble_ui.update(now)
batt_ui.update(now)
draw_clock()
oled.show()

ble_send_page()


# =========================================================
# LOOP PRINCIPAL
# =========================================================
while True:
    now = ticks_ms()
    dirty = False

    # STATUS BAR
    dirty |= wifi_ui.update(now)
    dirty |= ble_ui.update(now)
    dirty |= batt_ui.update(now)

    # NTP (uma vez quando conectar)
    if not time_synced:
        try:
            if wifi_ui.wlan.isconnected():
                sync_time()
        except:
            pass

    # CLOCK TOGGLE
    if ticks_diff(now, last_clock_toggle) >= CLOCK_TOGGLE_MS:
        clock_mode ^= 1
        last_clock_toggle = now
        draw_clock()
        dirty = True

    # BOTÕES
    key = read_menu()
    if key in ("LEFT", "UP"):
        action_prev()
    elif key in ("RIGHT", "DOWN"):
        action_next()
    elif key == "OK":
        action_ok()

    # BLE
    cmd = ble_ui.recv()
    if cmd:
        if isinstance(cmd, bytes):
            cmd = cmd.decode()
        handle_ble(cmd)

    if dirty:
        oled.show()

    machine.idle()
    sleep_ms(10)
