import machine
import time

# --- Configuração dos Pinos (Ajuste para sua placa) ---
# Raspberry Pi Pico: SDA=Pin(0), SCL=Pin(1)
# ESP32: SDA=Pin(21), SCL=Pin(22) (comum)
sda_pin = machine.Pin(16)
scl_pin = machine.Pin(15)

# Inicializa I2C0 com frequência de 400kHz
i2c = machine.I2C(0, sda=sda_pin, scl=scl_pin, freq=400000)

print("Iniciando Scan I2C...")

def scan_i2c():
    # Realiza o scan e retorna lista de endereços decimais
    devices = i2c.scan()
    
    if len(devices) == 0:
        print("Nenhum dispositivo I2C encontrado.")
    else:
        print(f"{len(devices)} dispositivos encontrados:")
        for device in devices:
            # Converte o endereço decimal para HEX
            print("Endereço I2C (Hex):", hex(device))

# Executa o scan
scan_i2c()
