import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
from datetime import datetime

# ==========================================
# 1. CONFIGURACIÓN SEGURA
# ==========================================
# Buscamos la llave en las variables de entorno de Render
api_key_segura = os.environ.get("GOOGLE_API_KEY")

if not api_key_segura:
    print("⚠️ ADVERTENCIA: No se encontró GOOGLE_API_KEY en las variables de entorno.")
else:
    # Limpieza de seguridad por si la llave tiene comillas o espacios pegados
    api_key_limpia = api_key_segura.replace('"', '').replace("'", "").strip()
    genai.configure(api_key=api_key_limpia)

# Instrucciones para la personalidad de la IA
INSTRUCCIONES_ABOGADO = """
Eres LexAI, un asistente jurídico experto internacional.
Tu objetivo es brindar orientación legal preliminar clara, profesional y empática.
Adapta tus respuestas al PAÍS que mencione el usuario.
"""

# Configuración del modelo (Usamos la versión estable del Flash)
# Si falla, el código intentará usar 'gemini-pro' automáticamente más abajo
model_flash = genai.GenerativeModel(model_name="gemini-1.5-flash", system_instruction=INSTRUCCIONES_ABOGADO)
model_pro = genai.GenerativeModel(model_name="gemini-pro", system_instruction=INSTRUCCIONES_ABOGADO)

app = FastAPI()

# Permisos para que Vercel conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. MODELOS DE DATOS
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

# ==========================================
# 3. RUTAS (ENDPOINTS)
# ==========================================
@app.get("/")
def home():
    return {"mensaje": "Cerebro LexAI Activo 🟢"}

@app.post("/consulta-legal")
async def consultar_ia(consulta: ConsultaLegal, email_usuario: str = "demo"):
    try:
        # Intento 1: Usar modelo Flash (Rápido)
        chat = model_flash.start_chat(history=[])
        response = chat.send_message(consulta.texto)
        return {"respuesta": response.text}
    except Exception as e:
        print(f"Error con Flash: {e}")
        try:
            # Intento 2: Usar modelo Pro (Respaldo)
            chat = model_pro.start_chat(history=[])
            response = chat.send_message(consulta.texto)
            return {"respuesta": response.text}
        except Exception as e2:
            print(f"Error Fatal: {e2}")
            # Mensaje amigable si falla todo
            raise HTTPException(status_code=500, detail="Error de conexión con la IA. Por favor intenta en 1 minuto.")

@app.post("/register")
def registrar(datos: SolicitudRegistro):
    return {"mensaje": "Registro exitoso"}

@app.post("/login")
def login(datos: SolicitudLogin):
    return {"mensaje": "Login correcto", "plan": "Gratis"}