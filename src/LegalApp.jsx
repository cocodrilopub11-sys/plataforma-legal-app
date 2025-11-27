import { useState } from 'react';

function LegalApp() {
  // Estados Generales
  const [view, setView] = useState('login'); // login | register | dashboard
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');

  // Estados del Dashboard Visual
  const [country, setCountry] = useState('EE.UU.');
  const [role, setRole] = useState('Defendant'); 
  const [inputMsg, setInputMsg] = useState('');

  // 👇 TU URL DE RENDER 👇
  const API_URL = "https://cerebro-legal.onrender.com"; 

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setPlan(data.plan || 'Gratis');
        setView('dashboard');
      } else {
        alert("Error: " + data.detail);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión. El servidor se está despertando, intenta de nuevo en 30 segs.");
    }
  };

  // --- REGISTRO ---
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, email, password })
      });
      if (res.ok) {
        alert("¡Cuenta creada! Ahora inicia sesión.");
        setView('login'); // Volver al login
      } else {
        const data = await res.json();
        alert("Error: " + data.detail);
      }
    } catch (error) {
      alert("Error de conexión al registrarse.");
    }
  };

  // --- ENVIAR MENSAJE ---
  const sendMessage = async (textoOverride) => {
    const textoFinal = textoOverride || inputMsg;
    if (!textoFinal) return;

    const newMsgs = [...messages, { text: textoFinal, type: "user" }];
    setMessages(newMsgs);
    setInputMsg('');
    setLoading(true);

    const promptContext = `Rol: ${role}. País: ${country}. Consulta: ${textoFinal}`;

    try {
      const res = await fetch(`${API_URL}/consulta-legal?email_usuario=${email}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: promptContext })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMessages([...newMsgs, { text: data.respuesta, type: "bot" }]);
      } else {
        setMessages([...newMsgs, { text: "Error: " + data.detail, type: "bot" }]);
      }
    } catch (error) {
      setLoading(false);
      setMessages([...newMsgs, { text: "Error de conexión con la IA.", type: "bot" }]);
    }
  };

  // ---------------------------------------
  // VISTA 1: DASHBOARD (APP PRINCIPAL)
  // ---------------------------------------
  if (view === 'dashboard') {
    return (
      <div className="app-container">
        <div className="top-nav">
          {['EE.UU.', 'Chile', 'México', 'España', 'Inmigración Global'].map((c) => (
            <button key={c} className={`nav-btn ${country === c ? 'active' : ''} ${c === 'Inmigración Global' ? 'purple' : ''}`} onClick={() => setCountry(c)}>{c}</button>
          ))}
        </div>

        {messages.length === 0 ? (
          <div className="hero-section">
            <h2 style={{textAlign: 'center', marginBottom: '20px', fontSize:'1.5rem'}}>¿Cómo puedo ayudarte hoy?</h2>
            <div className="grid-cards">
              <div className="info-card" onClick={() => sendMessage("Producto Defectuoso")}>
                <h3>Producto Defectuoso</h3>
                <p>Compré una laptop que dejó de funcionar después de una semana. ¿Cuáles son mis derechos?</p>
              </div>
              <div className="info-card" onClick={() => sendMessage("Estafa en Marketplace")}>
                <h3>Estafa en Marketplace</h3>
                <p>Pagué por un artículo, el vendedor nunca lo envió y eliminó su cuenta.</p>
              </div>
              <div className="info-card" onClick={() => sendMessage("Regalías no Pagadas")}>
                <h3>Regalías no Pagadas</h3>
                <p>Soy escritor y mi editorial no me ha pagado las regalías.</p>
              </div>
              <div className="info-card" onClick={() => sendMessage("Suspensión de Cuenta")}>
                <h3>Suspensión de Cuenta</h3>
                <p>La cuenta de mi tienda en línea fue suspendida sin razón clara.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{flex:1, overflowY:'auto', marginBottom:20, display:'flex', flexDirection:'column', gap:15}}>
             {messages.map((msg, idx) => (
              <div key={idx} style={{
                padding:15, borderRadius:8, maxWidth:'80%', lineHeight:1.5,
                alignSelf: msg.type==='user'?'flex-end':'flex-start',
                background: msg.type==='user'?'#0055ff':'#1e2330',
                color: msg.type==='user'?'white':'#e2e8f0',
                border: msg.type==='bot'?'1px solid #2a3241':'none'
              }}>
                {msg.text.split('\n').map((line, i) => <div key={i}>{line}<br/></div>)}
              </div>
            ))}
            {loading && <div style={{color:'#94a3b8', fontStyle:'italic'}}>Escribiendo...</div>}
          </div>
        )}

        <div className="input-section">
          <select className="custom-select">
            <option>Selecciona una categoría (opcional)</option>
            <option>Producto defectuoso o diferente</option>
            <option>Estafa o fraude en marketplace</option>
            <option>Suspensión de cuenta (autor/vendedor)</option>
            <option>Regalías o pagos no recibidos</option>
            <option>Otro tipo de problema</option>
          </select>
          <label className="role-label">¿Cuál es tu rol en este caso? <span style={{color:'red'}}>*</span></label>
          <div className="role-grid">
            <div className={`role-button ${role === 'Plaintiff' ? 'active' : ''}`} onClick={() => setRole('Plaintiff')}>Plaintiff</div>
            <div className={`role-button ${role === 'Defendant' ? 'active' : ''}`} onClick={() => setRole('Defendant')}>Defendant</div>
            <div className="role-button">Testador 👨‍⚖️</div>
            <div className="role-button">Testadora 👩‍⚖️</div>
          </div>
          <div className="modo-guiado">✨ Modo Guiado</div>
          <div className="chat-box-container">
            <textarea className="text-area" placeholder="Describe tu situación legal..." value={inputMsg} onChange={(e) => setInputMsg(e.target.value)}/>
            <div className="chat-footer">
              <span style={{fontSize:'1.2rem', color:'#94a3b8', cursor:'pointer'}}>📎</span>
              <button className="btn-enviar" onClick={() => sendMessage()}>Enviar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------
  // VISTA 2: LOGIN / REGISTRO (Aquí está el arreglo)
  // ---------------------------------------
  return (
    <div className="split-screen">
      <div className="left-panel">
        <h1 style={{fontSize: '3.5rem', color: '#c5a059', marginBottom: '1rem'}}>LexAI</h1>
        <p style={{fontSize: '1.2rem', color: '#94a3b8'}}>Tu asistente legal profesional.</p>
      </div>
      <div className="right-panel">
        <div className="form-box">
          
          {/* PESTAÑAS PARA CAMBIAR ENTRE LOGIN Y REGISTRO */}
          <div className="login-tabs">
            <div 
              className={`login-tab ${view === 'login' ? 'active' : ''}`} 
              onClick={() => setView('login')}
            >
              Ingresar
            </div>
            <div 
              className={`login-tab ${view === 'register' ? 'active' : ''}`} 
              onClick={() => setView('register')}
            >
              Registrarse
            </div>
          </div>

          {/* FORMULARIO DE LOGIN */}
          {view === 'login' && (
            <>
              <h2 style={{marginTop:0, color:'white'}}>Bienvenido</h2>
              <form onSubmit={handleLogin}>
                <input type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
                <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button className="btn-login">Ingresar</button>
              </form>
            </>
          )}

          {/* FORMULARIO DE REGISTRO */}
          {view === 'register' && (
            <>
              <h2 style={{marginTop:0, color:'white'}}>Crear Cuenta</h2>
              <form onSubmit={handleRegister}>
                <input type="text" placeholder="Nombre Completo" value={name} onChange={e=>setName(e.target.value)} required />
                <input type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
                <input type="password" placeholder="Crear Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button className="btn-login" style={{backgroundColor:'#4f46e5', color:'white'}}>Registrarse</button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default LegalApp;