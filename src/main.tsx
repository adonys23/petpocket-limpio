import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // <-- ESTA ES LA LÍNEA QUE CONECTA EL DISEÑO

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);