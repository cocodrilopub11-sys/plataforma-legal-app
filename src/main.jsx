import React from 'react'
import ReactDOM from 'react-dom/client'
import LegalApp from './LegalApp.jsx' // <--- ¡AQUÍ ESTÁ LA CLAVE!
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LegalApp />
  </React.StrictMode>,
)