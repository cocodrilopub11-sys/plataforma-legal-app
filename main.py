import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
from datetime import datetime

# ==========================================
# 1. CONFIGURACIÓN DE CEREBRO (GOOGLE AI)
# ==========================================

# ¡OJO! Pega aquí tu clave real dentro de las comillas
GOOGLE_API_KEY = "AIzaSyBdO5kZ8BR-d2iLNRTfBpcm5IZDFuGi8TQ" 

genai.configure(api_key=GOOGLE_API_KEY)

INSTRUCCIONES_ABOGADO = """
Eres un asistente jurídico experto y formal llamado LexAI.
Tu misión es ayudar a abogados y estudiantes de derecho.
Responde de manera precisa, citando leyes cuando sea posible.
Si no sabes una respuesta, no inventes leyes, di que necesitas investigar más.
Tu tono es profesional pero claro.
"""

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", 
    system_instruction=INSTRUCCIONES_ABOGADO
)

app = FastAPI()

# Configuración para que Vercel (la Nube) pueda hablar con este servidor
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite que cualquiera se conecte (ideal para pruebas)
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

# Base de datos temporal (se borra si reinicias el servidor)
users_db = []

def verificar_permiso(usuario: UsuarioModelo):
    if not usuario.activo:
        return False, "Cuenta desactivada."
        
    if usuario.plan == Plan.ADMIN or usuario.plan in [Plan.MENSUAL, Plan.VITALICIO]:
        return True, "Acceso ilimitado"
        
    if usuario.plan == Plan.GRATIS:
        # En modo demo permitimos más consultas para que pruebes tranquilo
        if usuario.consultas_realizadas >= 10:
            return False, "Has agotado tus consultas de prueba."
        return True, "Modo prueba"
        
    return False, "Error"

# ==========================================
# 3. RUTAS DE LA APP (ENDPOINTS)
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
    usuario_diccionario = next((u for u in users_db if u['email'] == email_usuario), None)
    
    if not usuario_diccionario:
        # Si no encuentra el usuario (por reinicio del servidor), creamos uno temporal
        # Esto evita errores mientras pruebas
        usuario_obj = UsuarioModelo(email="invitado", password="", nombre="Invitado")
    else:
        usuario_obj = UsuarioModelo(**usuario_diccionario)

    # Verificar permiso
    # puede_pasar, mensaje = verificar_permiso(usuario_obj)
    # if not puede_pasar:
    #     raise HTTPException(status_code=403, detail=mensaje)

    try:
        # Hablar con Google
        chat = model.start_chat(history=[])
        response = chat.send_message(consulta.texto)
        
        return {"respuesta": response.text}
            
    except Exception as e:
        print(f"Error IA: {e}")
        return {"respuesta": "Lo siento, hubo un error de conexión con mi cerebro jurídico. Intenta de nuevo."}