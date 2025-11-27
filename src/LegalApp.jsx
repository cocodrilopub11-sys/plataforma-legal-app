import { useState } from 'react';

function LegalApp() {
  // Estado de la App
  const [view, setView] = useState('login'); // login | dashboard
  const [messages, setMessages] = useState([]); // Historial del chat
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados visuales de la foto
  const [country, setCountry] = useState('EE.UU.');
  const [role, setRole] = useState('Plaintiff'); // Plaintiff vs Defendant

  // TUS DATOS DE LOGIN
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 👇👇👇 TU URL DE RENDER (NO LA BORRES) 👇👇👇
  const API_URL = "https://cerebro-legal.onrender.com"; 

  // --- FUNCIONES DE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    // Login simplificado para que entres rápido a ver el diseño
    if(email && password) setView('dashboard'); 
  };

  // --- FUNCIÓN PARA ENVIAR MENSAJE ---
  const sendMessage = async (textoOverride) => {
    const textoFinal = textoOverride || inputMsg;
    if (!textoFinal) return;

    // Agregamos mensaje del usuario a la pantalla
    const newMsgs = [...messages, { text: textoFinal, type: "user" }];
    setMessages(newMsgs);
    setInputMsg('');
    setLoading(true);

    // Contexto extra para la IA según los botones seleccionados
    const promptContext = `Rol: ${role}. País: ${country}. Consulta: ${textoFinal}`;

    try {
      const res = await fetch(`${API_URL}/consulta-legal?email_usuario=${email || 'demo'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: promptContext })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMessages([...newMsgs, { text: data.respuesta, type: "bot" }]);
      } else {
        setMessages([...newMsgs, { text: "Error del servidor: " + data.detail, type: "bot" }]);
      }
    } catch (error) {
      setLoading(false);
      setMessages([...newMsgs, { text: "Error de conexión. Espera a que despierte el servidor.", type: "bot" }]);
    }
  };

  // ---------------------------------------
  // VISTA: DASHBOARD (DISEÑO DE LA FOTO)
  // ---------------------------------------
  if (view === 'dashboard') {
    return (
      <div className="app-container">
        
        {/* 1. PESTAÑAS DE PAÍSES */}
        <div className="country-tabs">
          {['EE.UU.', 'Chile', 'México', 'España', 'Inmigración Global'].map((c) => (
            <div 
              key={c} 
              className={`country-tab ${country === c ? 'active' : ''}`}
              onClick={() => setCountry(c)}
            >
              {c}
            </div>
          ))}
        </div>

        {/* SI NO HAY MENSAJES, MOSTRAMOS LA BIENVENIDA Y TARJETAS (COMO LA FOTO) */}
        {messages.length === 0 ? (
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <h2 style={{textAlign: 'center', marginBottom: '40px', fontSize: '1.8rem', color: '#e2e8f0'}}>
              ¿Cómo puedo ayudarte hoy?
            </h2>

            <div className="suggestions-grid">
              <div className="card" onClick={() => sendMessage("Compré una laptop defectuosa hace una semana. ¿Cuáles son mis derechos?")}>
                <h3>Producto Defectuoso</h3>
                <p>Compré una laptop que dejó de funcionar... ¿Cuáles son mis derechos?</p>
              </div>
              <div className="card" onClick={() => sendMessage("Me estafaron en Marketplace, pagué y no recibí nada.")}>
                <h3>Estafa en Marketplace</h3>
                <p>Pagué por un artículo en línea pero el vendedor eliminó su cuenta.</p>
              </div>
              <div className="card" onClick={() => sendMessage("No me han pagado mis regalías editoriales.")}>
                <h3>Regalías no Pagadas</h3>
                <p>Soy escritor y mi editorial no me ha pagado las regalías.</p>
              </div>
              <div className="card" onClick={() => sendMessage("Mi cuenta de tienda en línea fue suspendida injustamente.")}>
                <h3>Suspensión de Cuenta</h3>
                <p>La cuenta de mi tienda fue suspendida sin razón clara.</p>
              </div>
            </div>
          </div>
        ) : (
          /* SI YA HAY MENSAJES, MOSTRAMOS EL CHAT */
          <div className="chat-history">
            {messages.map((msg, idx) => (
              <div key={idx} className={`msg-bubble ${msg.type === 'user' ? 'msg-user' : 'msg-bot'}`}>
                {msg.text.split('\n').map((line, i) => <div key={i}>{line}<br/></div>)}
              </div>
            ))}
            {loading && <div className="msg-bubble msg-bot" style={{fontStyle: 'italic'}}>Analizando caso...</div>}
          </div>
        )}

        {/* 3. ÁREA DE INPUT (COMO LA FOTO) */}
        <div className="input-area">
          <div style={{marginBottom: '10px', color:'#94a3b8', fontSize:'0.9rem'}}>¿Cuál es tu rol en este caso? *</div>
          
          <div className="role-selector">
            <div 
              className={`role-btn ${role === 'Plaintiff' ? 'active' : ''}`}
              onClick={() => setRole('Plaintiff')}
            >
              Plaintiff (Demandante)
            </div>
            <div 
              className={`role-btn ${role === 'Defendant' ? 'active-defendant' : ''}`}
              onClick={() => setRole('Defendant')}
            >
              Defendant (Demandado)
            </div>
          </div>

          <textarea 
            className="chat-textarea" 
            placeholder={`Describe tu situación legal en ${country} o adjunta un documento...`}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
          />

          <div className="input-footer">
            <span style={{fontSize: '1.2rem', cursor:'pointer'}}>📎</span>
            <button className="btn-send" onClick={() => sendMessage()}>Enviar</button>
          </div>
        </div>

      </div>
    );
  }

  // ---------------------------------------
  // VISTA: LOGIN (SIMPLE)
  // ---------------------------------------
  return (
    <div className="split-screen">
      <div className="left-panel">
        <h1 style={{fontSize: '3.5rem', color: '#c5a059', marginBottom: '1rem'}}>LexAI</h1>
        <p style={{fontSize: '1.2rem', color: '#94a3b8'}}>Tu asistente legal profesional.</p>
      </div>
      <div className="right-panel">
        <div className="form-box">
          <h2 style={{marginTop:0, color:'white'}}>Bienvenido</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn-login">Ingresar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LegalApp;