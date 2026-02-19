from machine import I2C, Pin
from mfrc522_i2c import MFRC522
from rfid_i2c import RFID_I2C
import time

i2c = I2C(0, sda=Pin(39), scl=Pin(40), freq=400_000)
rdr = MFRC522(0, 0x28)
rfid = RFID_I2C(rdr)

BLOCK = 4

print("Aproxime o cartão para leitura única...")

while True:
    evt = rfid.update()

    if evt == "inserted":
        print("Cartão detectado")

    txt = rfid.read_text_once(BLOCK)
    if txt:
        print("📖 Conteúdo:", txt)

    time.sleep_ms(40)
