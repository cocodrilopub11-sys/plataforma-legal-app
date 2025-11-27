import { useState } from 'react';

function LegalApp() {
  // Estados
  const [country, setCountry] = useState('EE.UU.');
  const [role, setRole] = useState('Defendant'); // Por defecto azul en la foto
  const [inputMsg, setInputMsg] = useState('');
  
  // Esto simula el envío (puedes conectar tu lógica real aquí después)
  const sendMessage = () => {
    if(!inputMsg) return;
    alert("Enviando: " + inputMsg); 
    setInputMsg('');
  };

  return (
    <div className="app-container">
      
      {/* 1. NAV SUPERIOR */}
      <div className="top-nav">
        <button 
          className={`nav-btn ${country === 'EE.UU.' ? 'active' : ''}`} 
          onClick={() => setCountry('EE.UU.')}>EE.UU.</button>
        <button className="nav-btn">Chile</button>
        <button className="nav-btn">México</button>
        <button className="nav-btn">España</button>
        <button className="nav-btn purple">Inmigración Global</button>
      </div>

      {/* 2. CAJA PRINCIPAL */}
      <div className="hero-section">
        
        <h2 style={{textAlign: 'center', marginBottom: '20px', fontSize:'1.5rem'}}>
          ¿Cómo puedo ayudarte hoy?
        </h2>

        {/* GRID DE 4 TARJETAS */}
        <div className="grid-cards">
          <div className="info-card">
            <h3>Producto Defectuoso</h3>
            <p>Compré una laptop que dejó de funcionar después de una semana. ¿Cuáles son mis derechos?</p>
          </div>
          <div className="info-card">
            <h3>Estafa en Marketplace</h3>
            <p>Pagué por un artículo, el vendedor nunca lo envió y eliminó su cuenta. ¿Puedo recuperar mi dinero?</p>
          </div>
          <div className="info-card">
            <h3>Regalías no Pagadas</h3>
            <p>Soy escritor y mi editorial no me ha pagado las regalías del último trimestre.</p>
          </div>
          <div className="info-card">
            <h3>Suspensión de Cuenta</h3>
            <p>La cuenta de mi tienda en línea fue suspendida sin razón clara y no puedo acceder a fondos.</p>
          </div>
        </div>

        {/* 3. SECCIÓN DE INPUTS (DROPDOWN Y BOTONES) */}
        <div className="input-section">
          
          {/* Dropdown */}
          <select className="custom-select">
            <option>Selecciona una categoría (opcional)</option>
            <option>Derecho Civil</option>
            <option>Derecho Laboral</option>
          </select>

          {/* Selector de Rol */}
          <label className="role-label">¿Cuál es tu rol en este caso? <span style={{color:'red'}}>*</span></label>
          
          <div className="role-grid">
            <div 
              className={`role-button ${role === 'Plaintiff' ? 'active' : ''}`}
              onClick={() => setRole('Plaintiff')}
            >
              Plaintiff
            </div>
            <div 
              className={`role-button ${role === 'Defendant' ? 'active' : ''}`}
              onClick={() => setRole('Defendant')}
            >
              Defendant
            </div>
            
            <div className="role-button">Testador 👨‍⚖️</div>
            <div className="role-button">Testadora 👩‍⚖️</div>
          </div>

          <div className="modo-guiado">✨ Modo Guiado</div>

          {/* Caja de Texto */}
          <div className="chat-box-container">
            <textarea 
              className="text-area" 
              placeholder="Describe tu situación legal o adjunta un documento para analizarlo..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
            />
            <div className="chat-footer">
              <span style={{fontSize:'1.2rem', color:'#94a3b8', cursor:'pointer'}}>📎</span>
              <button className="btn-enviar" onClick={sendMessage}>Enviar</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LegalApp;