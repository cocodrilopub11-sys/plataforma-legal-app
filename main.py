import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
from datetime import datetime

# ==========================================
# 1. CONFIGURACIÓN SEGURA (CON CAJA FUERTE)
# ==========================================

# Buscamos la llave en las variables de entorno de Render
api_key_segura = os.environ.get("GOOGLE_API_KEY")

# --- INICIO DIAGNÓSTICO (Para ver en los logs si la clave está bien) ---
print("--- INICIO DIAGNÓSTICO ---")
if api_key_segura:
    print(f"🔑 Longitud de la clave: {len(api_key_segura)}")
    print(f"🔑 Primeros 3 caracteres: '{api_key_segura[:3]}'")
    
    if '"' in api_key_segura or "'" in api_key_segura:
        print("🚨 ALERTA ROJA: La clave tiene comillas atrapadas!")
    if " " in api_key_segura:
        print("🚨 ALERTA ROJA: La clave tiene espacios en blanco!")
else:
    print("🚨 ALERTA ROJA: Render no está encontrando la variable GOOGLE_API_KEY")
print("--- FIN DIAGNÓSTICO ---")

# Configuración de Google
if not api_key_segura:
    print("⚠️ ERROR CRÍTICO: El servidor no puede arrancar sin la API KEY")
else:
    # Limpieza extra de seguridad
    api_key_limpia = api_key_segura.replace('"', '').replace("'", "").strip()
    genai.configure(api_key=api_key_limpia)

# ==========================================
# 2. PERSONALIDAD DE LA IA
# ==========================================
INSTRUCCIONES_ABOGADO = """
Eres LexAI, un asistente jurídico experto internacional.
Tu objetivo es brindar orientación legal preliminar clara, profesional y empática.

IMPORTANTE:
1. El usuario te indicará su ROL (Demandante/Plaintiff o Demandado/Defendant) y el PAÍS.
2. Debes adaptar tus respuestas a la legislación de ese PAÍS específico.
3. Si el país es "Inmigración Global", responde con leyes internacionales o generales.
4. Siempre aclara que eres una IA y que esto no sustituye el consejo de un abogado humano.
5. Sé estructurado: Usa puntos clave y pasos a seguir.
"""

# Configuración de modelos (Estrategia Doble: Flash primero, luego Pro)
model_flash = genai.GenerativeModel(model_name="gemini-1.5-flash", system_instruction=INSTRUCCIONES_ABOGADO)
model_pro = genai.GenerativeModel(model_name="gemini-pro", system_instruction=INSTRUCCIONES_ABOGADO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 3. MODELOS DE DATOS
# ==========================================

class ConsultaLegal(BaseModel):
    texto: str 

class SolicitudRegistro(BaseModel):
    nombre: str
    email: str
    password: str

class SolicitudLogin(BaseModel):
    email: str
    password: str

# Base de datos temporal
users_db = []

# ==========================================
# 4. RUTAS (ENDPOINTS)
# ==========================================

@app.get("/")
def home():
    return {"mensaje": "Cerebro LexAI Online y Listo 🧠"}

@app.post("/register")
def registrar_usuario(datos: SolicitudRegistro):
    return {"mensaje": "Registro exitoso", "usuario": datos.nombre}

@app.post("/login")
def iniciar_sesion(datos: SolicitudLogin):
    return {
        "mensaje": "Login correcto", 
        "usuario": "Usuario Demo", 
        "email": datos.email, 
        "plan": "Gratis"
    }

@app.post("/consulta-legal")
async def consultar_ia(consulta: ConsultaLegal, email_usuario: str = "demo"):
    try:
        # INTENTO 1: Usar modelo Flash (Rápido)
        print("🤖 Intentando con Gemini 1.5 Flash...")
        chat = model_flash.start_chat(history=[])
        response = chat.send_message(consulta.texto)
        return {"respuesta": response.text}
            
    except Exception as e_flash:
        print(f"⚠️ Error con Flash: {e_flash}. Intentando con Pro...")
        try:
            # INTENTO 2: Usar modelo Pro (Respaldo compatible)
            print("🐢 Intentando con Gemini Pro...")
            chat = model_pro.start_chat(history=[])
            response = chat.send_message(consulta.texto)
            return {"respuesta": response.text}
        except Exception as e_pro:
            print(f"🚨 Error Fatal con ambos modelos: {e_pro}")
            raise HTTPException(status_code=500, detail="Error de conexión con la IA. Por favor intenta más tarde.")