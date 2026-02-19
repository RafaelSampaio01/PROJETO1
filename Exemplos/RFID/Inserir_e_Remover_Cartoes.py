from machine import I2C, Pin
import time

# Flag global
rfid_ok = False
rfid = None

# -------------------------------
# Tentativa de inicialização RFID
# -------------------------------
try:
    from lib.mihuRFID.rfid_service import RFIDService

    i2c = I2C(
        0,
        scl=Pin(40),
        sda=Pin(39),
        freq=400000
    )

    devices = i2c.scan()
    print("I2C scan:", devices)

    if 0x28 not in devices:
        raise OSError("RFID não encontrado no I2C")

    rfid = RFIDService(
        i2c_id=0,
        scl=40,
        sda=39,
        addr=0x28
    )

    rfid_ok = True
    print("✅ RFID inicializado com sucesso")

except Exception as e:
    print("⚠️ RFID desabilitado:", e)
    rfid_ok = False

# -------------------------------
# Loop principal
# -------------------------------
while True:

    if rfid_ok:
        event = rfid.update()

        if event == "inserted":
            print("📥 Cartão inserido")
            uid, data = rfid.read(add=2)
            print("UID:", uid, "DATA:", data)

        elif event == "removed":
            print("📤 Cartão removido")

    else:
        # Sistema segue funcionando sem RFID
        pass

    time.sleep_ms(50)
