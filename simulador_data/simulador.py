import threading
import time
import random
from datetime import datetime
from pymongo import MongoClient


# --- Conexión a MongoDB ---
def conectar_mongodb():
    uri = "mongodb+srv://Audrie8a:Audrie8a7024.@acme.h1dmjul.mongodb.net/?retryWrites=true&w=majority&appName=ACME"
    cliente = MongoClient(uri)
    db = cliente["ACME"]
    coleccion = db["Estados"]
    coleccion.create_index([("IdDispositivo", 1), ("FechaHora", 1)], unique=True)
    return coleccion


# --- Estado persistente por VIN ---
class Dispositivo:
    def __init__(self, vin):
        self.vin = vin
        self.estado_carga = random.randint(20, 80)  # Batería inicial razonable
        self.kilometros = random.randint(5000, 50000)  # Kilometraje inicial
        self.onoff = random.choice([True, False])  # Estado inicial On/Off
        self.estado = "000"  # Sin errores al inicio

    def simular_estado(self):
        ahora = datetime.now()

        if self.onoff:
            # El vehículo está encendido
            # Consumo de batería realista
            if self.estado_carga > 5:
                self.estado_carga -= random.uniform(0.5, 2)
                self.estado_carga = max(0, round(self.estado_carga, 1))

            # Incremento realista de kilómetros
            km_recorridos = random.uniform(0.5, 3)
            self.kilometros += km_recorridos
            self.kilometros = round(self.kilometros, 1)

            # Posibilidad de error
            if random.random() < 0.05:  # 5% de chance de error
                self.estado = f"{random.randint(1, 99):03d}"
            else:
                self.estado = "000"

        else:
            # Vehículo apagado: no cambia carga ni km
            # Pero podría estar cargando si enchufado
            if random.random() < 0.3 and self.estado_carga < 100:
                self.estado_carga += random.uniform(1, 3)
                self.estado_carga = min(100, round(self.estado_carga, 1))
            self.estado = "000"  # No hay errores si está apagado

        return {
            "IdDispositivo": self.vin,
            "FechaHora": ahora,
            "EstadoCarga": self.estado_carga,
            "OnOff": self.onoff,
            "Estado": self.estado,
            "Kilometros": self.kilometros
        }

    def actualizar_estado(self):
        # Puede cambiar aleatoriamente el estado On/Off
        if random.random() < 0.05:
            self.onoff = not self.onoff


# --- Simulador ---
def simular_estado_tiempo_real(vin, coleccion, dispositivo):
    while True:
        try:
            documento = dispositivo.simular_estado()
            coleccion.insert_one(documento)
            print(f"Insertado {vin} @ {documento['FechaHora']} | Carga: {documento['EstadoCarga']}% | KM: {documento['Kilometros']} | OnOff: {documento['OnOff']}")
            dispositivo.actualizar_estado()  # Cambiar On/Off aleatoriamente
        except Exception as e:
            print(f"Error insertando {vin}: {e}")

        time.sleep(10)  # Datos cada 10 segundos (más frecuencia)


# --- Inicio de simulación ---
def iniciar_simulacion_concurrente(vins):
    coleccion = conectar_mongodb()
    dispositivos = {vin: Dispositivo(vin) for vin in vins}
    threads = []

    for vin in vins:
        t = threading.Thread(target=simular_estado_tiempo_real, args=(vin, coleccion, dispositivos[vin]))
        t.daemon = True
        t.start()
        threads.append(t)

    return threads


# --- Configuración de VINs ---
vins = [f"VIN{i:05}" for i in range(1, 6)]  # 5 VINs diferentes
iniciar_simulacion_concurrente(vins)

# Mantener el script activo
while True:
    time.sleep(60)