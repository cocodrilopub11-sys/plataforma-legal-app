import { useState } from 'react';

function App() {
  const [view, setView] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([{ text: "Bienvenido, colega. Soy LexAI. ¿En qué puedo asistirle hoy?", type: "bot" }]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');

  // ⚠️ IMPORTANTE: Aquí va la dirección de tu Python local
  const API_URL = "http://127.0.0.1:8001"; 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setPlan(data.plan);
        setView('dashboard');
      } else {
        alert(data.detail);
      }
    } catch (error) {
      alert("Error de conexión. Asegúrate de que tu Python (Terminal negra) esté corriendo.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, email, password })
      });
      if (res.ok) {
        alert("Cuenta creada. Inicia sesión.");
        setView('login');
      } else {
        alert("Error al registrar.");
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  const sendMessage = async () => {
    if (!inputMsg) return;
    const newMsgs = [...messages, { text: inputMsg, type: "user" }];
    setMessages(newMsgs);
    setInputMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/consulta-legal?email_usuario=${email}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: inputMsg })
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
      setMessages([...newMsgs, { text: "Error de conexión con el servidor.", type: "bot" }]);
    }
  };

  // VISTA DEL DASHBOARD (CHAT)
  if (view === 'dashboard') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', padding: '20px' }}>
        <div className="chat-container">
          <div style={{ padding: '20px', background: '#182235', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'Playfair Display', color: '#c5a059', fontSize: '1.4rem' }}>LexAI</h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Plan: {plan.toUpperCase()}</span>
            </div>
            <button onClick={() => setView('login')} style={{ width: 'auto', padding: '8px 15px', margin: 0, background: '#334155', color: 'white', border: '1px solid #475569' }}>Salir</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.type}`}>
                {msg.text.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
              </div>
            ))}
            {loading && <div className="msg bot" style={{ color: '#94a3b8' }}>Analizando jurisprudencia...</div>}
          </div>

          <div style={{ padding: '20px', background: '#182235', display: 'flex', gap: '10px', borderTop: '1px solid #334155' }}>
            <input 
              type="text" 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escriba su consulta..." 
              style={{ margin: 0 }} 
            />
            <button onClick={sendMessage} style={{ width: '100px', margin: 0 }}>Enviar ➤</button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA DE LOGIN / REGISTRO
  return (
    <div className="split-screen">
      <div className="left-panel">
        <h1>LexAI</h1>
        <p>Su socio jurídico impulsado por Inteligencia Artificial.<br />Analice casos y redacte escritos en segundos.</p>
      </div>
      <div className="right-panel">
        <div className="form-box">
          <div className="tabs">
            <div className={`tab ${view === 'login' ? 'active' : ''}`} onClick={() => setView('login')}>Ingresar</div>
            <div className={`tab ${view === 'register' ? 'active' : ''}`} onClick={() => setView('register')}>Registrarse</div>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Correo Profesional</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="abogado@firma.com" required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit">Entrar al Sistema</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" required />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crear contraseña" required />
              <button type="submit">Crear Cuenta Gratuita</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;