import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Esto nos mostrará el error en la pantalla si algo falla
window.addEventListener('error', (event) => {
  document.body.innerHTML = `
    <div style="color: white; padding: 20px; font-family: sans-serif;">
      <h1 style="color: #ff6b6b;">⚠️ Error detectado</h1>
      <p style="font-size: 1.2rem;">${event.message}</p>
      <p>En archivo: ${event.filename}</p>
    </div>
  `;
});

const root = document.getElementById('root');

if (root) {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (e) {
    console.error(e);
  }
} else {
  document.body.innerHTML = '<h1 style="color:red">Error: No existe el div "root" en index.html</h1>';
}