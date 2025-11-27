import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
from datetime import datetime

# ==========================================
# 1. CONFIGURACIÓN SEGURA (USANDO LA CAJA FUERTE)
# ==========================================

# Buscamos la llave en las variables de entorno de Render
api_key_segura = os.environ.get("GOOGLE_API_KEY")

if not api_key_segura:
    print("⚠️ ERROR: No encontré la variable GOOGLE_API_KEY en Render")
else:
    genai.configure(api_key=api_key_segura)

INSTRUCCIONES_ABOGADO = """
Eres un asistente jurídico experto y formal llamado LexAI.
Tu misión es ayudar a abogados y estudiantes de derecho.
Responde de manera precisa, citando leyes cuando sea posible.
Si no sabes una respuesta, no inventes leyes, di que necesitas investigar más.
Tu tono es profesional pero claro.
"""

# Usamos el modelo estándar
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", 
    system_instruction=INSTRUCCIONES_ABOGADO
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. BASE DE DATOS Y MODELOS
# ==========================================

class Plan(str, Enum):
    GRATIS = "gratis"       
    MENSUAL = "mensual"     
    VITALICIO = "vitalicio" 
    ADMIN = "admin"         

class UsuarioModelo(BaseModel):
    email: str
    password: str
    nombre: str
    plan: Plan = Plan.GRATIS
    consultas_realizadas: int = 0
    activo: bool = True 
    fecha_registro: datetime = datetime.now()

users_db = []

# ==========================================
# 3. RUTAS
# ==========================================

class SolicitudRegistro(BaseModel):
    nombre: str
    email: str
    password: str

class SolicitudLogin(BaseModel):
    email: str
    password: str

class ConsultaLegal(BaseModel):
    texto: str

@app.get("/")
def home():
    return {"mensaje": "Cerebro LexAI Online 🧠"}

@app.post("/register")
def registrar_usuario(datos: SolicitudRegistro):
    for u in users_db:
        if u['email'] == datos.email:
            raise HTTPException(status_code=400, detail="El correo ya existe")
    
    nuevo_usuario = {
        "email": datos.email,
        "password": datos.password,
        "nombre": datos.nombre,
        "plan": Plan.GRATIS,
        "consultas_realizadas": 0,
        "activo": True,
        "fecha_registro": datetime.now()
    }
    users_db.append(nuevo_usuario)
    return {"mensaje": "Registro exitoso", "usuario": datos.nombre}

@app.post("/login")
def iniciar_sesion(datos: SolicitudLogin):
    for u in users_db:
        if u['email'] == datos.email and u['password'] == datos.password:
            return {
                "mensaje": "Login correcto", 
                "usuario": u['nombre'], 
                "email": u['email'], 
                "plan": u['plan']
            }
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

@app.post("/consulta-legal")
async def consultar_ia(consulta: ConsultaLegal, email_usuario: str):
    # En esta versión simplificada no verificamos usuario para asegurar que funcione la prueba
    try:
        chat = model.start_chat(history=[])
        response = chat.send_message(consulta.texto)
        return {"respuesta": response.text}
            
    except Exception as e:
        print(f"Error IA: {e}")
        # Esto imprimirá el error real en los logs si vuelve a fallar
        raise HTTPException(status_code=500, detail=f"Error del motor IA: {str(e)}")
    
    # Forzando actualización de Render