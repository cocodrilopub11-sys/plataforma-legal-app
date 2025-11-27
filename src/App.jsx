import React from 'react';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      color: 'gold',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem' }}>¡ESTOY VIVO! 🚀</h1>
      <p style={{ color: 'white', fontSize: '1.5rem' }}>
        Si lees esto, la página web funciona perfectamente.
      </p>
    </div>
  );
}

export default App;